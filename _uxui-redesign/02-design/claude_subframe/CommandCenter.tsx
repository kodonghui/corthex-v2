"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { TextArea } from "@/ui/components/TextArea";
import { FeatherActivity } from "@subframe/core";
import { FeatherAtSign } from "@subframe/core";
import { FeatherBookmark } from "@subframe/core";
import { FeatherBrain } from "@subframe/core";
import { FeatherCalendarClock } from "@subframe/core";
import { FeatherCheck } from "@subframe/core";
import { FeatherDownload } from "@subframe/core";
import { FeatherFileText } from "@subframe/core";
import { FeatherGitBranch } from "@subframe/core";
import { FeatherHome } from "@subframe/core";
import { FeatherList } from "@subframe/core";
import { FeatherMessageCircle } from "@subframe/core";
import { FeatherPlay } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSend } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherSlash } from "@subframe/core";
import { FeatherTerminal } from "@subframe/core";
import { FeatherThumbsDown } from "@subframe/core";
import { FeatherThumbsUp } from "@subframe/core";
import { FeatherTrendingUp } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherWrench } from "@subframe/core";
import * as SubframeCore from "@subframe/core";

function CommandCenter() {
  return (
    <div className="flex h-full w-full items-start bg-default-background">
      <div className="flex w-64 flex-none flex-col items-start gap-2 self-stretch bg-neutral-900 px-4 py-4">
        <div className="flex w-full items-center gap-3 px-2 py-3">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-brand-600">
            <FeatherBrain className="text-body font-body text-white" />
          </div>
          <span className="grow shrink-0 basis-0 text-heading-3 font-heading-3 text-white">
            CORTHEX
          </span>
        </div>
        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-700" />
        <div className="flex w-full flex-col items-start gap-1 py-2">
          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-800">
            <FeatherHome className="text-body font-body text-neutral-400" />
            <span className="grow shrink-0 basis-0 text-body font-body text-neutral-300">
              홈
            </span>
          </div>
          <div className="flex w-full items-center gap-3 rounded-md bg-neutral-800 px-3 py-2">
            <FeatherTerminal className="text-body font-body text-brand-400" />
            <span className="grow shrink-0 basis-0 text-body font-body text-white">
              사령관실
            </span>
          </div>
          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-800">
            <FeatherUsers className="text-body font-body text-neutral-400" />
            <span className="grow shrink-0 basis-0 text-body font-body text-neutral-300">
              에이전트
            </span>
          </div>
          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-800">
            <FeatherWrench className="text-body font-body text-neutral-400" />
            <span className="grow shrink-0 basis-0 text-body font-body text-neutral-300">
              도구
            </span>
          </div>
          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-800">
            <FeatherCalendarClock className="text-body font-body text-neutral-400" />
            <span className="grow shrink-0 basis-0 text-body font-body text-neutral-300">
              배치 작업
            </span>
          </div>
          <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-800">
            <FeatherFileText className="text-body font-body text-neutral-400" />
            <span className="grow shrink-0 basis-0 text-body font-body text-neutral-300">
              보고서
            </span>
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start" />
        <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-700" />
        <div className="flex w-full items-center gap-3 px-2 py-3">
          <Avatar
            size="small"
            image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
          >
            C
          </Avatar>
          <div className="flex grow shrink-0 basis-0 flex-col items-start">
            <span className="text-body-bold font-body-bold text-white">
              CEO
            </span>
            <span className="text-caption font-caption text-neutral-400">
              관리자
            </span>
          </div>
          <IconButton
            variant="neutral-tertiary"
            size="small"
            icon={<FeatherSettings />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          />
        </div>
      </div>
      <div className="flex grow shrink-0 basis-0 items-start self-stretch">
        <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch">
          <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-6 py-4">
            <FeatherTerminal className="text-heading-2 font-heading-2 text-brand-600" />
            <div className="flex grow shrink-0 basis-0 flex-col items-start">
              <span className="text-heading-3 font-heading-3 text-default-font">
                사령관실
              </span>
              <span className="text-caption font-caption text-subtext-color">
                AI 조직에 자연어 명령을 전달하세요
              </span>
            </div>
            <Badge variant="success" icon={<FeatherActivity />}>
              시스템 정상
            </Badge>
          </div>
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 px-6 py-6 overflow-auto">
            <div className="flex w-full flex-col items-end gap-2">
              <div className="flex max-w-[448px] flex-col items-end gap-1">
                <div className="flex flex-col items-end gap-2 rounded-lg bg-brand-600 px-4 py-3">
                  <span className="text-body font-body text-white">
                    다음 분기 마케팅 전략 보고서를 작성해주세요. 경쟁사 분석과
                    시장 트렌드를 포함해서요.
                  </span>
                </div>
                <span className="text-caption font-caption text-subtext-color">
                  오전 10:32
                </span>
              </div>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-3 border-t border-solid border-neutral-border px-6 py-4">
            <div className="flex w-full items-end gap-3">
              <TextArea
                className="h-auto grow shrink-0 basis-0"
                variant="outline"
                label=""
                helpText=""
              >
                <TextArea.Input
                  placeholder="명령을 입력하세요... (@로 에이전트 멘션, /로 명령어 사용)"
                  value=""
                  onChange={(
                    event: React.ChangeEvent<HTMLTextAreaElement>
                  ) => {}}
                />
              </TextArea>
              <Button
                variant="brand-primary"
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

export default CommandCenter;
