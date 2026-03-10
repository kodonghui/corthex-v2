"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Tooltip } from "@/ui/components/Tooltip";
import { FeatherArrowRight } from "@subframe/core";
import { FeatherAtSign } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherCommand } from "@subframe/core";
import { FeatherDownload } from "@subframe/core";
import { FeatherFileCheck } from "@subframe/core";
import { FeatherFileText } from "@subframe/core";
import { FeatherFolderOpen } from "@subframe/core";
import { FeatherGitBranch } from "@subframe/core";
import { FeatherHash } from "@subframe/core";
import { FeatherHistory } from "@subframe/core";
import { FeatherList } from "@subframe/core";
import { FeatherLoader } from "@subframe/core";
import { FeatherMaximize2 } from "@subframe/core";
import { FeatherMessageCircle } from "@subframe/core";
import { FeatherMessageSquare } from "@subframe/core";
import { FeatherPaperclip } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSend } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherSlash } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import { FeatherThumbsDown } from "@subframe/core";
import { FeatherThumbsUp } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherWrench } from "@subframe/core";
import { FeatherZap } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

function CommandCenter2() {
  return (
    <div className="flex h-full w-full items-start bg-neutral-950">
      <div className="flex w-16 flex-none flex-col items-center gap-4 self-stretch border-r border-solid border-neutral-800 bg-neutral-900 px-2 py-4">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand-600">
            <FeatherCommand className="text-heading-2 font-heading-2 text-white" />
          </div>
        </div>
        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-800" />
        <div className="flex grow shrink-0 basis-0 flex-col items-center gap-2">
          <SubframeCore.Tooltip.Provider>
            <SubframeCore.Tooltip.Root>
              <SubframeCore.Tooltip.Trigger asChild={true}>
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand-600 cursor-pointer">
                  <FeatherMessageSquare className="text-body-bold font-body-bold text-white" />
                </div>
              </SubframeCore.Tooltip.Trigger>
              <SubframeCore.Tooltip.Portal>
                <SubframeCore.Tooltip.Content
                  side="right"
                  align="center"
                  sideOffset={8}
                  asChild={true}
                >
                  <Tooltip>사령관실</Tooltip>
                </SubframeCore.Tooltip.Content>
              </SubframeCore.Tooltip.Portal>
            </SubframeCore.Tooltip.Root>
          </SubframeCore.Tooltip.Provider>
          <SubframeCore.Tooltip.Provider>
            <SubframeCore.Tooltip.Root>
              <SubframeCore.Tooltip.Trigger asChild={true}>
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg cursor-pointer hover:bg-neutral-800">
                  <FeatherUsers className="text-body-bold font-body-bold text-neutral-400" />
                </div>
              </SubframeCore.Tooltip.Trigger>
              <SubframeCore.Tooltip.Portal>
                <SubframeCore.Tooltip.Content
                  side="right"
                  align="center"
                  sideOffset={8}
                  asChild={true}
                >
                  <Tooltip>조직도</Tooltip>
                </SubframeCore.Tooltip.Content>
              </SubframeCore.Tooltip.Portal>
            </SubframeCore.Tooltip.Root>
          </SubframeCore.Tooltip.Provider>
          <SubframeCore.Tooltip.Provider>
            <SubframeCore.Tooltip.Root>
              <SubframeCore.Tooltip.Trigger asChild={true}>
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg cursor-pointer hover:bg-neutral-800">
                  <FeatherFolderOpen className="text-body-bold font-body-bold text-neutral-400" />
                </div>
              </SubframeCore.Tooltip.Trigger>
              <SubframeCore.Tooltip.Portal>
                <SubframeCore.Tooltip.Content
                  side="right"
                  align="center"
                  sideOffset={8}
                  asChild={true}
                >
                  <Tooltip>프로젝트</Tooltip>
                </SubframeCore.Tooltip.Content>
              </SubframeCore.Tooltip.Portal>
            </SubframeCore.Tooltip.Root>
          </SubframeCore.Tooltip.Provider>
          <SubframeCore.Tooltip.Provider>
            <SubframeCore.Tooltip.Root>
              <SubframeCore.Tooltip.Trigger asChild={true}>
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg cursor-pointer hover:bg-neutral-800">
                  <FeatherWrench className="text-body-bold font-body-bold text-neutral-400" />
                </div>
              </SubframeCore.Tooltip.Trigger>
              <SubframeCore.Tooltip.Portal>
                <SubframeCore.Tooltip.Content
                  side="right"
                  align="center"
                  sideOffset={8}
                  asChild={true}
                >
                  <Tooltip>도구</Tooltip>
                </SubframeCore.Tooltip.Content>
              </SubframeCore.Tooltip.Portal>
            </SubframeCore.Tooltip.Root>
          </SubframeCore.Tooltip.Provider>
        </div>
        <div className="flex flex-col items-center gap-2">
          <SubframeCore.Tooltip.Provider>
            <SubframeCore.Tooltip.Root>
              <SubframeCore.Tooltip.Trigger asChild={true}>
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg cursor-pointer hover:bg-neutral-800">
                  <FeatherSettings className="text-body-bold font-body-bold text-neutral-400" />
                </div>
              </SubframeCore.Tooltip.Trigger>
              <SubframeCore.Tooltip.Portal>
                <SubframeCore.Tooltip.Content
                  side="right"
                  align="center"
                  sideOffset={8}
                  asChild={true}
                >
                  <Tooltip>설정</Tooltip>
                </SubframeCore.Tooltip.Content>
              </SubframeCore.Tooltip.Portal>
            </SubframeCore.Tooltip.Root>
          </SubframeCore.Tooltip.Provider>
        </div>
      </div>
      <div className="flex grow shrink-0 basis-0 flex-col items-center self-stretch">
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-800 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-heading-2 font-heading-2 text-white">
              사령관실
            </span>
            <Badge variant="brand" icon={<FeatherZap />}>
              실시간
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              variant="neutral-tertiary"
              icon={<FeatherHistory />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
            <IconButton
              variant="neutral-tertiary"
              icon={<FeatherMaximize2 />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
          </div>
        </div>
        <div className="flex w-full max-w-[768px] grow shrink-0 basis-0 flex-col items-center gap-4 px-6 py-6 overflow-auto">
          <div className="flex w-full items-end justify-end gap-3">
            <div className="flex max-w-[576px] flex-col items-end gap-1">
              <div className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-3">
                <span className="text-body font-body text-white">
                  마케팅 전략 보고서를 작성해줘. 2024년 Q4 SNS 캠페인에 대한
                  분석과 2025년 Q1 전략 제안을 포함해줘.
                </span>
              </div>
              <span className="text-caption font-caption text-neutral-500">
                2분 전
              </span>
            </div>
            <Avatar variant="brand" size="small" image="">
              나
            </Avatar>
          </div>
        </div>
        <div className="flex w-full max-w-[768px] flex-col items-center gap-3 px-6 pb-6">
          <div className="flex w-full flex-col items-start gap-3 rounded-xl border border-solid border-neutral-700 bg-neutral-800 px-4 py-4 shadow-lg">
            <div className="flex w-full items-start gap-2">
              <textarea
                className="min-h-[56px] min-w-[0px] grow shrink-0 basis-0 text-body font-body text-white outline-none placeholder:text-neutral-500 resize-none"
                placeholder="명령을 입력하세요... (@로 에이전트 멘션, /로 명령어)"
              />
            </div>
            <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-700" />
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-caption font-caption text-neutral-500">
                  ⌘ + Enter로 전송
                </span>
              </div>
              <Button
                icon={<FeatherSend />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                전송
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandCenter2;
