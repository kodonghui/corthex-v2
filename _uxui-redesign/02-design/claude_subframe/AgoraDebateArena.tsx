"use client";

import React from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { TextField } from "@/ui/components/TextField";
import { FeatherChevronRight } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherMessageCircle } from "@subframe/core";
import { FeatherMessageSquare } from "@subframe/core";
import { FeatherMoreVertical } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherRadio } from "@subframe/core";
import { FeatherRefreshCw } from "@subframe/core";
import { FeatherScale } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";

function AgoraDebateArena() {
  return (
    <div className="flex h-full w-full items-start bg-default-background">
      <div className="flex w-80 flex-none flex-col items-start gap-4 self-stretch bg-neutral-900 px-4 py-6">
        <div className="flex w-full items-center gap-2">
          <FeatherMessageCircle className="text-heading-2 font-heading-2 text-white" />
          <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-white">
            아고라
          </span>
          <IconButton
            variant="inverse"
            size="small"
            icon={<FeatherPlus />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          />
        </div>
        <TextField
          className="h-auto w-full flex-none"
          variant="filled"
          label=""
          helpText=""
          icon={<FeatherSearch />}
        >
          <TextField.Input
            placeholder="토론 검색..."
            value=""
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
          />
        </TextField>
        <div className="flex w-full items-center gap-2">
          <Badge variant="neutral" icon={null}>
            전체
          </Badge>
          <Badge variant="brand" icon={null}>
            진행중
          </Badge>
          <Badge variant="success" icon={null}>
            완료
          </Badge>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 overflow-auto">
          <div className="flex w-full flex-col items-start gap-3 rounded-md bg-neutral-800 px-4 py-4">
            <div className="flex w-full items-start gap-2">
              <span className="line-clamp-2 grow shrink-0 basis-0 text-body-bold font-body-bold text-white">
                AI 윤리와 규제의 균형점
              </span>
              <Badge variant="brand" icon={null}>
                진행중
              </Badge>
            </div>
            <div className="flex w-full items-center gap-2">
              <div className="flex items-center gap-1">
                <FeatherUsers className="text-caption font-caption text-neutral-400" />
                <span className="text-caption font-caption text-neutral-400">
                  4명
                </span>
              </div>
              <div className="flex items-center gap-1">
                <FeatherMessageSquare className="text-caption font-caption text-neutral-400" />
                <span className="text-caption font-caption text-neutral-400">
                  3라운드
                </span>
              </div>
              <span className="grow shrink-0 basis-0 text-caption font-caption text-neutral-400 text-right">
                2024.01.15
              </span>
            </div>
          </div>
        </div>
        <Button
          className="h-auto w-full flex-none"
          icon={<FeatherPlus />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
        >
          새 토론 만들기
        </Button>
      </div>
      <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch">
        <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border px-6 py-6">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
            <div className="flex items-center gap-3">
              <span className="text-heading-2 font-heading-2 text-default-font">
                AI 윤리와 규제의 균형점
              </span>
              <Badge variant="brand" icon={<FeatherRadio />}>
                진행중
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="neutral" icon={null}>
                심층토론
              </Badge>
              <span className="text-caption font-caption text-subtext-color">
                최대 5라운드 · 현재 3라운드
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              icon={<FeatherRefreshCw />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
            <IconButton
              icon={<FeatherMoreVertical />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
          </div>
        </div>
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-6 py-6 overflow-auto">
          <div className="flex w-full flex-col items-start gap-4">
            <div className="flex w-full items-center gap-3">
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-100">
                <span className="text-body-bold font-body-bold text-brand-700">
                  1
                </span>
              </div>
              <span className="text-heading-3 font-heading-3 text-default-font">
                1라운드
              </span>
              <div className="flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgoraDebateArena;
