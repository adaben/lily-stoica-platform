import { Helmet } from "react-helmet-async";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor,
  MessageSquare, Loader2, X, Send,
} from "lucide-react";
import { toast } from "sonner";
import { apiGetVideoRoom, apiSignalSend, apiSignalPoll, apiLogVideoEvent } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

export default function VideoCallPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [roomId, setRoomId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const sendSignal = useCallback(
    async (type: string, payload: unknown) => {
      if (!roomId) return;
      try {
        await apiSignalSend(roomId, { type, payload: JSON.stringify(payload) });
      } catch {
        // non-critical
      }
    },
    [roomId]
  );

  const createPeer = useCallback(
    (stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (evt) => {
        if (evt.candidate) {
          sendSignal("ice-candidate", evt.candidate.toJSON());
        }
      };

      pc.ontrack = (evt) => {
        if (remoteVideoRef.current && evt.streams[0]) {
          remoteVideoRef.current.srcObject = evt.streams[0];
        }
        setConnected(true);
        setConnecting(false);
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          setConnected(false);
          toast.info("The other participant disconnected.");
        }
      };

      peerRef.current = pc;
      return pc;
    },
    [sendSignal]
  );

  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      const pc = peerRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal("answer", answer);
    },
    [sendSignal]
  );

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    const pc = peerRef.current;
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = peerRef.current;
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch {
      // ignore
    }
  }, []);

  const handleChatSignal = useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  }, []);

  // Initialise room and media
  useEffect(() => {
    if (!bookingId) return;

    let cancelled = false;

    const init = async () => {
      try {
        const room = await apiGetVideoRoom(bookingId);
        if (cancelled) return;
        setRoomId(room.room_id);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) return;

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = createPeer(stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal("offer", offer);

        await apiLogVideoEvent(room.room_id, "joined");
        setConnecting(false);
      } catch (err) {
        if (!cancelled) {
          toast.error("Could not access camera or microphone.");
          setConnecting(false);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // Polling for signals
  useEffect(() => {
    if (!roomId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const signals = await apiSignalPoll(roomId);
        for (const sig of signals) {
          const payload = JSON.parse(sig.payload);
          switch (sig.signal_type) {
            case "offer":
              await handleOffer(payload);
              break;
            case "answer":
              await handleAnswer(payload);
              break;
            case "ice-candidate":
              await handleIceCandidate(payload);
              break;
            case "chat":
              handleChatSignal(payload);
              break;
          }
        }
      } catch {
        // polling error, non-critical
      }
    }, 1500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [roomId, handleOffer, handleAnswer, handleIceCandidate, handleChatSignal]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setAudioEnabled(!audioEnabled);
  };

  const toggleScreenShare = async () => {
    const pc = peerRef.current;
    if (!pc) return;

    if (screenSharing) {
      // revert to camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = new MediaStream([
          videoTrack,
          ...(localStreamRef.current?.getAudioTracks() || []),
        ]);
      }
      setScreenSharing(false);
    } else {
      try {
        const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = display.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
        screenTrack.onended = () => {
          toggleScreenShare();
        };
        setScreenSharing(true);
      } catch {
        toast.error("Screen sharing was cancelled.");
      }
    }
  };

  const hangUp = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    peerRef.current?.close();
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (roomId) apiLogVideoEvent(roomId, "left");
    navigate("/dashboard");
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      sender: user?.first_name || "You",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, msg]);
    sendSignal("chat", msg);
    setChatInput("");
  };

  return (
    <>
      <Helmet>
        <title>Session | LiLy Stoica</title>
      </Helmet>

      <div className="fixed inset-0 bg-gray-950 text-white flex flex-col">
        {/* Video area */}
        <div className="flex-1 relative flex items-center justify-center">
          {connecting && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-950/80">
              <div className="text-center space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                <p className="text-sm text-gray-300">Connecting to session...</p>
              </div>
            </div>
          )}

          {/* Remote video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local video (picture-in-picture) */}
          <div className="absolute bottom-20 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700/50">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
            />
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <VideoOff className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>

          {/* Connection status */}
          <div className="absolute top-4 left-4">
            <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
              connected ? "bg-green-900/60 text-green-300" : "bg-amber-900/60 text-amber-300"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-amber-400"}`} />
              {connected ? "Connected" : "Waiting for participant"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 py-4 bg-gray-900/90 border-t border-gray-800">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              audioEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
            }`}
            title={audioEnabled ? "Mute" : "Unmute"}
          >
            {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              videoEnabled ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
            }`}
            title={videoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-colors ${
              screenSharing ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
            }`}
            title="Share screen"
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-3 rounded-full transition-colors ${
              chatOpen ? "bg-primary hover:bg-primary/90" : "bg-gray-700 hover:bg-gray-600"
            }`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={hangUp}
            className="p-3 rounded-full bg-red-600 hover:bg-red-500 transition-colors"
            title="Leave session"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <div className="absolute right-0 top-0 bottom-[72px] w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-sm font-medium">Session Chat</h3>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="text-primary font-medium">{m.sender}</span>{" "}
                  <span className="text-gray-500 text-xs">{m.time}</span>
                  <p className="text-gray-300">{m.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 p-3 border-t border-gray-800">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-sm bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary/40 text-white placeholder-gray-500"
              />
              <button
                onClick={sendChat}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`.mirror { transform: scaleX(-1); }`}</style>
    </>
  );
}
