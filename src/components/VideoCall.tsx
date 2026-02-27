/**
 * VideoCall â€” WebRTC peer-to-peer video conferencing component.
 *
 * Features:
 *  - Camera & microphone toggle
 *  - Screen sharing with proper fit (object-contain) + signal to remote
 *  - Robust leave / rejoin without blocking the peer
 *  - Draggable & hideable local video PiP
 *  - Fullscreen mode
 *  - HTTP-polling signalling (no WebSocket dependency)
 */
import { Component, useCallback, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  PhoneOff, Loader2, AlertCircle, Maximize, Minimize, Eye, EyeOff,
  Copy, Check,
} from "lucide-react";
import { apiGetVideoRoom, apiLogVideoEvent, apiSignalSend, apiSignalPoll } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface VideoCallProps {
  bookingId: string;
  onClose: () => void;
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

const POLL_INTERVAL_MS = 1500;

const VideoCall = ({ bookingId, onClose }: VideoCallProps) => {
  const { user } = useAuth();

  /* â”€â”€ refs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const containerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const makingOfferRef = useRef(false);
  const politeRef = useRef(false);

  /* â”€â”€ PiP drag refs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const pipRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ dragging: boolean; offsetX: number; offsetY: number }>({ dragging: false, offsetX: 0, offsetY: 0 });

  /* â”€â”€ state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [remoteScreenSharing, setRemoteScreenSharing] = useState(false);
    const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pipVisible, setPipVisible] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);

  /* â”€â”€ fetch room info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const { data: roomInfo } = useQuery({
    queryKey: ["video-room", bookingId],
    queryFn: () => apiGetVideoRoom(bookingId),
  });

  const roomId = roomInfo?.room_id || "";

  /* â”€â”€ shareable link â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const shareableLink = `${window.location.origin}/session/${bookingId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  /* â”€â”€ fullscreen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* â”€â”€ PiP drag handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const onPipPointerDown = useCallback((e: React.PointerEvent) => {
    const pip = pipRef.current;
    if (!pip) return;
    dragState.current = {
      dragging: true,
      offsetX: e.clientX - pip.getBoundingClientRect().left,
      offsetY: e.clientY - pip.getBoundingClientRect().top,
    };
    pip.setPointerCapture(e.pointerId);
    pip.style.transition = "none";
  }, []);

  const onPipPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const pip = pipRef.current;
    const parent = pip?.parentElement;
    if (!pip || !parent) return;
    const parentRect = parent.getBoundingClientRect();
    let x = e.clientX - dragState.current.offsetX - parentRect.left;
    let y = e.clientY - dragState.current.offsetY - parentRect.top;
    x = Math.max(0, Math.min(x, parentRect.width - pip.offsetWidth));
    y = Math.max(0, Math.min(y, parentRect.height - pip.offsetHeight));
    pip.style.left = `${x}px`;
    pip.style.top = `${y}px`;
    pip.style.right = "auto";
    pip.style.bottom = "auto";
  }, []);

  const onPipPointerUp = useCallback((e: React.PointerEvent) => {
    dragState.current.dragging = false;
    const pip = pipRef.current;
    if (pip) {
      pip.releasePointerCapture(e.pointerId);
      pip.style.transition = "";
    }
  }, []);

  /* â”€â”€ signal send helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const sendSignal = useCallback(async (type: string, payload: unknown) => {
    if (!roomId) return;
    try {
      await apiSignalSend(roomId, { type, payload: JSON.stringify(payload) });
    } catch (err) {
      console.error("[VideoCall] signal send error:", err);
    }
  }, [roomId]);

  /* â”€â”€ create (or recreate) a fresh RTCPeerConnection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const createPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.onnegotiationneeded = null;
      try { pcRef.current.close(); } catch { /* ignore */ }
    }

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    const localStream = localStreamRef.current;
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    pc.ontrack = (event) => {
      if (!mountedRef.current) return;
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(() => {});
        setRemoteConnected(true);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal("ice-candidate", event.candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      if (!mountedRef.current) return;
      const state = pc.connectionState;
      if (state === "connected") {
        /* connected */;
        setConnecting(false);
        setRemoteConnected(true);
      } else if (state === "disconnected") {
        setRemoteConnected(false);
      } else if (state === "failed") {
        setRemoteConnected(false);
        /* disconnected */;
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (!mountedRef.current) return;
      if (pc.iceConnectionState === "failed") {
        pc.restartIce();
      }
    };

    return pc;
  }, [sendSignal]);

  /* â”€â”€ signalling message handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const handleSignallingMessage = useCallback(async (sig: { signal_type: string; payload: string }) => {
    const pc = pcRef.current;
    const type = sig.signal_type;
    let payload: any;
    try {
      payload = typeof sig.payload === "string" ? JSON.parse(sig.payload) : sig.payload;
    } catch {
      payload = sig.payload;
    }

    try {
      if (type === "leave") {
        setRemoteConnected(false);
        /* disconnected */;
        setRemoteScreenSharing(false);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        createPeerConnection();
        return;
      }

      if (type === "join" || type === "rejoin") {
        setRemoteConnected(false);
        setRemoteScreenSharing(false);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        const newPc = createPeerConnection();
        try {
          const offer = await newPc.createOffer({ iceRestart: true });
          await newPc.setLocalDescription(offer);
          sendSignal("offer", newPc.localDescription);
        } catch (err) {
          console.error("[VideoCall] Error creating offer for join:", err);
        }
        return;
      }

      if (type === "screen-start") { setRemoteScreenSharing(true); return; }
      if (type === "screen-stop") { setRemoteScreenSharing(false); return; }

      if (!pc) return;

      if (type === "offer") {
        const offerCollision = makingOfferRef.current || pc.signalingState !== "stable";
        const ignoreOffer = !politeRef.current && offerCollision;
        if (ignoreOffer) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal("answer", pc.localDescription);
      } else if (type === "answer") {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
        }
      } else if (type === "ice-candidate") {
        try {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(payload));
          }
        } catch (err) {
          console.warn("[VideoCall] ICE candidate error (non-fatal):", err);
        }
      }
    } catch (err) {
      console.error("[VideoCall] Signalling error:", err);
    }
  }, [sendSignal, createPeerConnection]);

  const handleSignallingRef = useRef(handleSignallingMessage);
  useEffect(() => { handleSignallingRef.current = handleSignallingMessage; }, [handleSignallingMessage]);

  /* â”€â”€ polling loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const startPolling = useCallback(() => {
    if (pollTimerRef.current || !roomId) return;
    pollTimerRef.current = setInterval(async () => {
      try {
        const signals = await apiSignalPoll(roomId);
        if (signals?.length) {
          for (const sig of signals) {
            await handleSignallingRef.current(sig as any);
          }
        }
      } catch { /* transient */ }
    }, POLL_INTERVAL_MS);
  }, [roomId]);

  /* â”€â”€ attach local stream to video element â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const attachLocalVideo = useCallback(() => {
    const el = localVideoRef.current;
    const stream = localStreamRef.current;
    if (el && stream) {
      if (el.srcObject !== stream) el.srcObject = stream;
      el.play().catch(() => {});
    }
  }, []);

  /* â”€â”€ initialise local media & peer connection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useEffect(() => {
    if (!roomId) return;
    mountedRef.current = true;

    // Client is the polite side (yields on simultaneous offers)
    politeRef.current = user?.role === "client";

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true },
        });

        if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }

        localStreamRef.current = stream;
        attachLocalVideo();
        requestAnimationFrame(() => {
          attachLocalVideo();
          setTimeout(() => attachLocalVideo(), 300);
        });

        createPeerConnection();
        setConnecting(false);

        apiLogVideoEvent(roomId, "joined").catch(() => {});
        sendSignal("join", { user_name: user?.first_name || "Participant" });
        startPolling();
      } catch (err: any) {
        if (mountedRef.current) {
          setError(err.message || "Could not access camera/microphone. Please check permissions.");
          setConnecting(false);
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      sendSignal("leave", {});
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      if (pcRef.current) {
        pcRef.current.ontrack = null;
        pcRef.current.onicecandidate = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.oniceconnectionstatechange = null;
        pcRef.current.onnegotiationneeded = null;
        pcRef.current.close();
      }
      if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
      apiLogVideoEvent(roomId, "left").catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (!connecting) attachLocalVideo();
  }, [connecting, attachLocalVideo]);

  /* â”€â”€ controls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const toggleCam = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
    }
  };

  const toggleScreenShare = async () => {
    const pc = pcRef.current;
    if (!pc) return;

    if (screenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        sender?.replaceTrack(camTrack);
      }
      setScreenSharing(false);
      sendSignal("screen-stop", {});
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" } as any,
          audio: false,
        });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        sender?.replaceTrack(screenTrack);
        setScreenSharing(true);
        sendSignal("screen-start", {});

        screenTrack.onended = () => {
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack) sender?.replaceTrack(camTrack);
          screenStreamRef.current = null;
          setScreenSharing(false);
          sendSignal("screen-stop", {});
        };
      } catch { /* User cancelled */ }
    }
  };

  const hangUp = () => {
    sendSignal("leave", {});
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
    }
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    apiLogVideoEvent(roomId, "left").catch(() => {});
    onClose();
  };

  /* â”€â”€ render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  if (error) {
    return (
      <div ref={containerRef} className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Camera/Microphone Error</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button onClick={onClose} className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const remoteVideoFit = remoteScreenSharing ? "object-contain" : "object-cover";

  return (
    <div ref={containerRef} className="fixed inset-0 z-[60] bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${remoteConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          <span className="text-white font-medium text-sm truncate max-w-[200px]">
            {roomInfo?.session_type ? `${roomInfo.session_type.replace("_", " ")} Session` : "Coaching Session"}
          </span>
          <span className="text-gray-400 text-xs hidden sm:inline">
            {remoteConnected ? "Connected" : "Waiting for the other participant..."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyLink}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600"
            title="Copy video call link">
            {linkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{linkCopied ? "Copied!" : "Share link"}</span>
          </button>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-gray-900">
          {connecting ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
                <p className="text-white/70">Initialising camera...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Remote video (main) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full ${remoteVideoFit} bg-gray-800`}
              />
              {!remoteConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-gray-400">
                        {user?.role === "admin" ? "C" : "L"}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">Waiting for the other participant to join...</p>
                    <p className="text-white/30 text-xs mt-2 mb-4">Both participants can leave and rejoin freely</p>
                    <button onClick={copyLink}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                      {linkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {linkCopied ? "Link copied!" : "Copy invite link"}
                    </button>
                  </div>
                </div>
              )}

              {/* Screen sharing indicator */}
              {remoteScreenSharing && remoteConnected && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-blue-600/90 text-white text-xs px-3 py-1.5 rounded-lg">
                  <Monitor className="w-3.5 h-3.5" /> Peer is sharing their screen
                </div>
              )}

              {/* Local video (PiP) â€” draggable & hideable */}
              {pipVisible && (
                <div
                  ref={pipRef}
                  className="absolute bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-gray-600 shadow-2xl bg-gray-900 cursor-grab active:cursor-grabbing select-none touch-none"
                  onPointerDown={onPipPointerDown}
                  onPointerMove={onPipPointerMove}
                  onPointerUp={onPipPointerUp}
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {!camOn && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <VideoOff className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1">
                    <span className="text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">You</span>
                  </div>
                </div>
              )}
              {!pipVisible && (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="hidden"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div className="h-20 bg-gray-800 border-t border-gray-700 flex items-center justify-center gap-3 px-4">
        <button onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micOn ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-red-500 text-white hover:bg-red-600"}`}
          title={micOn ? "Mute microphone" : "Unmute microphone"}>
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button onClick={toggleCam}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${camOn ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-red-500 text-white hover:bg-red-600"}`}
          title={camOn ? "Turn off camera" : "Turn on camera"}>
          {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button onClick={toggleScreenShare}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${screenSharing ? "bg-primary text-primary-foreground" : "bg-gray-600 text-white hover:bg-gray-500"}`}
          title={screenSharing ? "Stop sharing" : "Share screen"}>
          {screenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </button>

        <div className="w-px h-8 bg-gray-600 mx-1" />

        <button onClick={() => setPipVisible(v => !v)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${pipVisible ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"}`}
          title={pipVisible ? "Hide self view" : "Show self view"}>
          {pipVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>

        <button onClick={toggleFullscreen}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-600 text-white hover:bg-gray-500 transition-colors"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>

        <div className="w-px h-8 bg-gray-600 mx-1" />

        <button onClick={hangUp}
          className="w-14 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
          title="Leave call">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;

/* â”€â”€ Error Boundary wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
interface EBProps { children: ReactNode; onClose: () => void }
interface EBState { hasError: boolean; errorMsg: string }

export class VideoCallErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { hasError: false, errorMsg: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message || "An unexpected error occurred." };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[VideoCall] ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[60] bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white max-w-md p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Video Call Error</h2>
            <p className="text-white/70 mb-6">{this.state.errorMsg}</p>
            <button
              onClick={this.props.onClose}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


