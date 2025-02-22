"use client";

import { AVCanvas } from "@webav/av-canvas";
import { AudioClip, ImgClip, MP4Clip, VisibleSprite, renderTxt2ImgBitmap } from "@webav/av-cliper";
import { TimelineAction, TimelineRow, TimelineState } from "@xzdarcy/react-timeline-editor";
import { useEffect, useRef, useState } from "react";
import { assetsPrefix, createFileWriter, loadFile } from "@/lib/utils";
import TimelineEditor from "./components/TimelineEditor";

type TLActionWithName = TimelineAction & { name: string };

const uhaParam = new URLSearchParams(location.search).get("UHA");
const __unsafe_hardwareAcceleration__ = ["no-preference", "prefer-hardware", "prefer-software"].includes(uhaParam)
  ? uhaParam
  : undefined;

const actionSpriteMap = new WeakMap<TimelineAction, VisibleSprite>();

const clipsSrc = assetsPrefix(["video/bunny_0.mp4", "audio/16kHz-1chan.mp3", "img/bunny.png"]);

const Demo = () => {
  const [avCvs, setAVCvs] = useState<AVCanvas | null>(null);
  const tlState = useRef<TimelineState>(undefined);

  const [playing, setPlaying] = useState(false);
  const [clipSource, setClipSource] = useState("remote");

  const [cvsWrapEl, setCvsWrapEl] = useState<HTMLDivElement | null>(null);
  const [tlData, setTLData] = useState<TimelineRow[]>([
    { id: "1-video", actions: [] },
    { id: "2-audio", actions: [] },
    { id: "3-img", actions: [] },
    { id: "4-text", actions: [] }
  ]);

  useEffect(() => {
    if (cvsWrapEl == null) return;
    avCvs?.destroy();
    const cvs = new AVCanvas(cvsWrapEl, {
      bgColor: "#000",
      width: 1280,
      height: 720
    });
    setAVCvs(cvs);
    cvs.on("timeupdate", (time) => {
      if (tlState.current == null) return;
      tlState.current.setTime(time / 1e6);
    });
    cvs.on("playing", () => {
      setPlaying(true);
    });
    cvs.on("paused", () => {
      setPlaying(false);
    });

    return () => {
      cvs.destroy();
    };
  }, [cvsWrapEl]);

  const addSprite2Track = (trackId: string, spr: VisibleSprite, name = "") => {
    const track = tlData.find(({ id }) => id === trackId);
    if (track == null) return null;

    const start = spr.time.offset === 0 ? Math.max(...track.actions.map((a) => a.end), 0) * 1e6 : spr.time.offset;

    spr.time.offset = start;
    // image
    if (spr.time.duration === Infinity) {
      spr.time.duration = 10e6;
    }

    const action = {
      id: Math.random().toString(),
      start: start / 1e6,
      end: (spr.time.offset + spr.time.duration) / 1e6,
      effectId: "",
      name
    };

    actionSpriteMap.set(action, spr);

    track.actions.push(action);
    setTLData(
      tlData
        .filter((it) => it !== track)
        .concat({ ...track })
        .sort((a, b) => a.id.charCodeAt(0) - b.id.charCodeAt(0))
    );
    return action;
  };

  const onPreviewTime = (time: number) => {
    avCvs?.previewFrame(time * 1e6);
  };
  const onOffsetChange = (action: TimelineAction) => {
    const spr = actionSpriteMap.get(action);
    if (spr == null) return;
    spr.time.offset = action.start * 1e6;
  };
  const onDurationChange = ({ action, start, end }: { action: TimelineAction; start: number; end: number }) => {
    const spr = actionSpriteMap.get(action);
    if (spr == null) return false;
    const duration = (end - start) * 1e6;
    if (duration > spr.getClip().meta.duration) return false;
    spr.time.duration = duration;
    return true;
  };
  const onDeleteAction = (action: TimelineAction) => {
    const spr = actionSpriteMap.get(action);
    if (spr == null) return;
    avCvs?.removeSprite(spr);
    actionSpriteMap.delete(action);
    const track = tlData.map((t) => t.actions).find((actions) => actions.includes(action));
    if (track == null) return;
    track.splice(track.indexOf(action), 1);
    setTLData([...tlData]);
  };
  const onSplitAction = async (action: TLActionWithName) => {
    const spr = actionSpriteMap.get(action);
    if (avCvs == null || spr == null || tlState.current == null) return;
    const newClips = await spr.getClip().split(tlState.current.getTime() * 1e6 - spr.time.offset);
    // 移除原有对象
    avCvs.removeSprite(spr);
    actionSpriteMap.delete(action);
    const track = tlData.find((t) => t.actions.includes(action));
    if (track == null) return;
    track.actions.splice(track.actions.indexOf(action), 1);
    setTLData([...tlData]);
    // 添加分割后生成的两个新对象
    const sprsDuration = [
      tlState.current.getTime() * 1e6 - spr.time.offset,
      spr.time.duration - (tlState.current.getTime() * 1e6 - spr.time.offset)
    ];
    const sprsOffset = [spr.time.offset, spr.time.offset + sprsDuration[0]];
    for (let i = 0; i < newClips.length; i++) {
      const clip = newClips[i];
      const newSpr = new VisibleSprite(clip);
      if (clip instanceof ImgClip) {
        newSpr.time.duration = sprsDuration[i];
      }
      newSpr.time.offset = sprsOffset[i];
      await avCvs.addSprite(newSpr);
      addSprite2Track(track.id, newSpr, action.name);
    }
  };

  const handleAddVideo = async () => {
    const stream =
      clipSource === "local"
        ? (await loadFile({ "video/*": [".mp4", ".mov"] })).stream()
        : (await fetch(clipsSrc[0])).body!;
    const spr = new VisibleSprite(
      new MP4Clip(stream, {
        __unsafe_hardwareAcceleration__
      })
    );
    await avCvs?.addSprite(spr);
    addSprite2Track("1-video", spr, "视频");
  };
  const handleAddAudio = async () => {
    const stream =
      clipSource === "local"
        ? (await loadFile({ "audio/*": [".m4a", ".mp3"] })).stream()
        : (await fetch(clipsSrc[1])).body!;
    const spr = new VisibleSprite(new AudioClip(stream));
    await avCvs?.addSprite(spr);
    addSprite2Track("2-audio", spr, "音频");
  };
  const handleAddImg = async () => {
    let args;
    if (clipSource === "local") {
      const f = await loadFile({
        "image/*": [".png", ".jpeg", ".jpg", ".gif"]
      });
      const stream = f.stream();
      if (/\.gif$/.test(f.name)) {
        args = { type: "image/gif", stream };
      } else {
        args = stream;
      }
    } else {
      args = (await fetch(clipsSrc[2])).body!;
    }
    const spr = new VisibleSprite(new ImgClip(args));
    await avCvs?.addSprite(spr);
    addSprite2Track("3-img", spr, "图片");
  };
  const handleAddText = async () => {
    const spr = new VisibleSprite(new ImgClip(await renderTxt2ImgBitmap("示例文字", "font-size: 80px; color: red;")));
    await avCvs?.addSprite(spr);
    addSprite2Track("4-text", spr, "文字");
  };

  const togglePlayPause = async () => {
    if (avCvs == null || tlState.current == null) return;
    if (playing) {
      avCvs.pause();
    } else {
      avCvs.play({ start: tlState.current.getTime() * 1e6 });
    }
  };

  const exportVideo = async () => {
    if (avCvs == null) {
      return;
    }
    (await avCvs.createCombinator({ __unsafe_hardwareAcceleration__ })).output().pipeTo(await createFileWriter());
  };

  return (
    <div className="canvas-wrap">
      <div ref={(el) => setCvsWrapEl(el)}></div>
      <input
        type="radio"
        id="clip-source-remote"
        name="clip-source"
        defaultChecked={clipSource === "remote"}
        onChange={() => {
          setClipSource("remote");
        }}
      />
      <label htmlFor="clip-source-remote"> 示例素材</label>
      <input
        type="radio"
        id="clip-source-local"
        name="clip-source"
        defaultChecked={clipSource === "local"}
        onChange={() => {
          setClipSource("local");
        }}
      />
      <label htmlFor="clip-source-local"> 本地素材</label>
      <span className="mx-[10px]">|</span>
      <button className="mx-[10px]" onClick={handleAddVideo}>
        + 视频
      </button>
      <button className="mx-[10px]" onClick={handleAddAudio}>
        + 音频
      </button>
      <button className="mx-[10px]" onClick={handleAddImg}>
        + 图片
      </button>
      <button className="mx-[10px]" onClick={handleAddText}>
        + 文字
      </button>
      <span className="mx-[10px]">|</span>
      <button className="mx-[10px]" onClick={togglePlayPause}>
        {playing ? "暂停" : "播放"}
      </button>
      <button className="mx-[10px]" onClick={exportVideo}>
        导出视频
      </button>
      <p></p>
      <TimelineEditor
        timelineData={tlData}
        timelineState={tlState}
        onPreviewTime={onPreviewTime}
        onOffsetChange={onOffsetChange}
        onDurationChange={onDurationChange}
        onDeleteAction={onDeleteAction}
        onSplitAction={onSplitAction}
      ></TimelineEditor>
    </div>
  );
};

export default Demo;
