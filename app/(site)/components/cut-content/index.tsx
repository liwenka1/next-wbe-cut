"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline } from "@xzdarcy/react-timeline-editor";
import { useState } from "react";

const CutContent = () => {
  const [data, setData] = useState(mockData);

  return (
    <Card className="w-full">
      <div className="w-full">
        <Timeline
          style={{ width: "100%" }}
          onChange={setData}
          editorData={data}
          effects={mockEffect}
          hideCursor={false}
          autoScroll={true}
        />
      </div>
    </Card>
  );
};

export default CutContent;

import { TimelineEffect, TimelineRow } from "@xzdarcy/react-timeline-editor";

const mockEffect: Record<string, TimelineEffect> = {
  effect0: {
    id: "effect0",
    name: "效果0"
  },
  effect1: {
    id: "effect1",
    name: "效果1"
  }
};

const mockData: TimelineRow[] = [
  {
    id: "0",
    actions: [
      {
        id: "action00",
        start: 0,
        end: 2,
        effectId: "effect0"
      }
    ]
  },
  {
    id: "1",
    actions: [
      {
        id: "action10",
        start: 1.5,
        end: 5,
        effectId: "effect1"
      }
    ]
  },
  {
    id: "2",
    actions: [
      {
        id: "action20",
        flexible: false,
        movable: false,
        start: 3,
        end: 4,
        effectId: "effect0"
      }
    ]
  },
  {
    id: "3",
    actions: [
      {
        id: "action30",
        start: 4,
        end: 4.5,
        effectId: "effect1"
      },
      {
        id: "action31",
        start: 6,
        end: 8,
        effectId: "effect1"
      }
    ]
  }
];
