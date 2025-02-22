import UploadContent from "./components/upload-content";
import VideoContent from "./components/video.content";
import InfoContent from "./components/info-content";

const MainContent = () => {
  return (
    <div className="flex w-full flex-1 gap-2">
      <UploadContent />
      <VideoContent />
      <InfoContent />
    </div>
  );
};

export default MainContent;
