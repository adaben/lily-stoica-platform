import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import VideoCall, { VideoCallErrorBoundary } from "@/components/VideoCall";

export default function VideoCallPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  if (!bookingId) {
    navigate("/dashboard");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Video Session | Calm Lily</title>
      </Helmet>
      <VideoCallErrorBoundary onClose={() => navigate("/dashboard")}>
        <VideoCall bookingId={bookingId} onClose={() => navigate("/dashboard")} />
      </VideoCallErrorBoundary>
    </>
  );
}
