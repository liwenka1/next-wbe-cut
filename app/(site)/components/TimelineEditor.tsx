import { Timeline, TimelineAction, TimelineRow, TimelineState } from "@xzdarcy/react-timeline-editor";
import { useState } from "react";

type TLActionWithName = TimelineAction & { name: string };

const TimelineEditor = ({
  timelineData: tlData,
  onPreviewTime,
  onOffsetChange,
  onDurationChange,
  onDeleteAction,
  timelineState,
  onSplitAction
}: {
  timelineData: TimelineRow[];
  timelineState: React.RefObject<TimelineState | undefined>;
  onPreviewTime: (time: number) => void;
  onOffsetChange: (action: TimelineAction) => void;
  onDurationChange: (args: { action: TimelineAction; start: number; end: number }) => void;
  onDeleteAction: (action: TimelineAction) => void;
  onSplitAction: (action: TLActionWithName) => void;
}) => {
  const [scale, setScale] = useState(10);
  const [activeAction, setActiveAction] = useState<TLActionWithName | null>(null);
  return (
    <div className="">
      <div>
        <span className="ml-[10px]">缩放：</span>
        <button onClick={() => setScale(scale + 1)} className="rounded-full border">
          -
        </button>
        <button onClick={() => setScale(scale - 1 > 1 ? scale - 1 : 1)} className="rounded-full border">
          +
        </button>
        <span className="mx-[10px]">|</span>
        <button
          disabled={activeAction == null}
          className="mx-[10px]"
          onClick={() => {
            if (activeAction == null) return;
            onDeleteAction(activeAction);
          }}
        >
          删除
        </button>
        <button
          disabled={activeAction == null}
          className="mx-[10px]"
          onClick={() => {
            if (activeAction == null) return;
            onSplitAction(activeAction);
          }}
        >
          分割
        </button>
      </div>
      <Timeline
        ref={(v) => {
          if (v == null) return;
          timelineState.current = v;
        }}
        onChange={(d) => {}}
        style={{ width: "100%", height: "200px" }}
        scale={scale}
        editorData={tlData}
        effects={{}}
        scaleSplitCount={5}
        onClickTimeArea={(time) => {
          onPreviewTime(time);
          return true;
        }}
        onCursorDragEnd={(time) => {
          onPreviewTime(time);
        }}
        onActionResizing={({ dir, action, start, end }) => {
          if (dir === "left") return false;
          return onDurationChange({ action, start, end });
        }}
        onActionMoveEnd={({ action }) => {
          onOffsetChange(action);
        }}
        onClickAction={(_, { action }) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          setActiveAction(action);
        }}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        getActionRender={(action: TLActionWithName) => {
          const baseStyle = "h-full justify-center items-center flex text-white";
          if (action.id === activeAction?.id) {
            return <div className={`${baseStyle} box-border border border-solid border-red-300`}>{action.name}</div>;
          }
          return <div className={baseStyle}>{action.name}</div>;
        }}
        autoScroll
      />
    </div>
  );
};

export default TimelineEditor;
