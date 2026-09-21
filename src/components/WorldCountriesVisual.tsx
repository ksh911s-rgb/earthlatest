import React, { useState } from 'react';
import { GameState, TeamData } from '../types';
import { UPGRADES } from '../utils/constants';
import { CountryFlag } from './CountryFlag';
import { Trophy, Zap, ShieldAlert, Sparkles, Flame, Eye, LayoutGrid, Trees, Compass } from 'lucide-react';

interface WorldCountriesVisualProps {
  gameState: GameState;
  sortedTeams: TeamData[];
}

interface CountryMeta {
  flag: string;
  landmark: string;
  engName: string;
  bgGradient: string;
  accentColor: string;
  tierScenes: {
    tierTitle: string;
    description: string;
    bgGradient: string;
    skyIcons: string[];
    landmarks: string;
    elements: { icon: string; name: string; extraClass?: string }[];
  }[];
}

const COUNTRY_DETAILS: Record<string, CountryMeta> = {
  'team-1': {
    flag: '🇺🇸',
    landmark: '자유의 여신상 & 메가폴리스',
    engName: 'USA',
    bgGradient: 'from-blue-950 via-slate-900 to-zinc-950',
    accentColor: '#3B82F6',
    tierScenes: [
      {
        tierTitle: '서부 대평원 & 수작업 목장',
        description: '광활한 초원과 자연 친화적 개척지',
        bgGradient: 'from-sky-400 via-sky-300 to-emerald-600',
        skyIcons: ['☀️', '☁️'],
        landmarks: '🏞️ 록키산맥',
        elements: [
          { icon: '🌾', name: '대초원' },
          { icon: '🏡', name: '통나무집', extraClass: 'text-2xl' },
          { icon: '🐎', name: '야생마' },
          { icon: '🪵', name: '벌목목재' },
        ],
      },
      {
        tierTitle: '대륙횡단 철도 & 증기 공장',
        description: '석탄 증기 기관차로 대륙을 연결',
        bgGradient: 'from-slate-600 via-stone-700 to-stone-900',
        skyIcons: ['💨', '☁️'],
        landmarks: '🚂 대륙횡단철도',
        elements: [
          { icon: '⛏️', name: '석탄탄광' },
          { icon: '🚂', name: '증기기관차', extraClass: 'text-2xl' },
          { icon: '🏭', name: '초기공장' },
          { icon: '💨', name: '석탄연기' },
        ],
      },
      {
        tierTitle: '디트로이트 공장 & 피츠버그 제철',
        description: '거대한 굴뚝과 정유 탱크 대단지',
        bgGradient: 'from-zinc-700 via-stone-800 to-zinc-950',
        skyIcons: ['🌫️', '☁️'],
        landmarks: '🗽 자유의 여신상 & 제철소',
        elements: [
          { icon: '🏗️', name: '대형크레인' },
          { icon: '🏭', name: '거대제철소', extraClass: 'text-2xl' },
          { icon: '🛢️', name: '원유탱크' },
          { icon: '🌫️', name: '산업스모그' },
        ],
      },
      {
        tierTitle: '실리콘밸리 기가팩토리 & 로봇',
        description: '24시간 무인 가동되는 테슬라 로봇 라인',
        bgGradient: 'from-blue-950 via-slate-900 to-zinc-950',
        skyIcons: ['⚡', '✨'],
        landmarks: '🌉 금문교 하이테크 밸리',
        elements: [
          { icon: '🦾', name: '로봇팔', extraClass: 'animate-pulse text-2xl' },
          { icon: '🤖', name: '조립로봇' },
          { icon: '⚡', name: '초고압전력' },
          { icon: '📦', name: '자동물류' },
        ],
      },
      {
        tierTitle: '맨해튼 마천루 & 스페이스X 기지',
        description: '초고층 미래 빌딩과 우주 로켓 발사',
        bgGradient: 'from-indigo-950 via-purple-950 to-zinc-950',
        skyIcons: ['🚀', '🛰️'],
        landmarks: '🏙️ 엠파이어 & 우주기지',
        elements: [
          { icon: '🏙️', name: '초고층마천루', extraClass: 'text-2xl' },
          { icon: '🚀', name: '로켓발사', extraClass: 'animate-bounce' },
          { icon: '🌃', name: '네온도시' },
          { icon: '🛸', name: '스마트드론' },
        ],
      },
      {
        tierTitle: '멕시코만 심해 메가 유전 시추',
        description: '대륙붕 심해까지 뚫어 원유를 채굴',
        bgGradient: 'from-red-950 via-amber-950 to-black',
        skyIcons: ['🔥', '💥'],
        landmarks: '🌋 심해 유전 플랫폼',
        elements: [
          { icon: '⚙️', name: '초대형드릴', extraClass: 'animate-spin' },
          { icon: '🌋', name: '심해시추' },
          { icon: '🔥', name: '가스연소', extraClass: 'animate-bounce' },
          { icon: '⚡', name: '메가코어' },
        ],
      },
    ],
  },
  'team-2': {
    flag: '🇨🇳',
    landmark: '만리장성 & 초거대 산업지구',
    engName: 'China',
    bgGradient: 'from-red-950 via-stone-900 to-zinc-950',
    accentColor: '#EF4444',
    tierScenes: [
      {
        tierTitle: '황하강변 전통 정자와 들판',
        description: '황금빛 벼 들판과 평화로운 전통 마을',
        bgGradient: 'from-amber-300 via-sky-300 to-emerald-600',
        skyIcons: ['☀️', '☁️'],
        landmarks: '🏯 황하강 누각',
        elements: [
          { icon: '🌾', name: '황금들판' },
          { icon: '🏯', name: '전통누각', extraClass: 'text-2xl' },
          { icon: '🎋', name: '대나무숲' },
          { icon: '🪵', name: '수작업' },
        ],
      },
      {
        tierTitle: '만리장성 철도 & 초기 석탄 탄광',
        description: '산악 석탄을 실어 나르는 증기열차',
        bgGradient: 'from-stone-600 via-amber-950/80 to-stone-900',
        skyIcons: ['💨', '☁️'],
        landmarks: '🧱 만리장성 광산철도',
        elements: [
          { icon: '⛏️', name: '석탄채굴' },
          { icon: '🚂', name: '증기화물차', extraClass: 'text-2xl' },
          { icon: '🧱', name: '성벽철길' },
          { icon: '💨', name: '석탄연기' },
        ],
      },
      {
        tierTitle: '세계의 공장! 광둥 굴뚝 대단지',
        description: '전 세계의 물품을 찍어내는 거대 굴뚝과 황사',
        bgGradient: 'from-zinc-700 via-amber-900 to-zinc-950',
        skyIcons: ['🏭', '🌫️'],
        landmarks: '🏭 주강 삼각주 공업지대',
        elements: [
          { icon: '🏭', name: '대형공장군', extraClass: 'text-2xl' },
          { icon: '🏗️', name: '조선소' },
          { icon: '🛢️', name: '석유콤비나트' },
          { icon: '🌫️', name: '황사스모그' },
        ],
      },
      {
        tierTitle: '선전 하이테크 & 무인 로봇 단지',
        description: '스마트폰과 드론을 생산하는 자동화 기지',
        bgGradient: 'from-red-950 via-slate-900 to-zinc-950',
        skyIcons: ['⚡', '🤖'],
        landmarks: '🦾 선전 테크놀로지 허브',
        elements: [
          { icon: '🦾', name: '정밀조립로봇', extraClass: 'animate-pulse text-2xl' },
          { icon: '📱', name: '스마트기기' },
          { icon: '🤖', name: '물류로봇' },
          { icon: '⚡', name: '초고속가동' },
        ],
      },
      {
        tierTitle: '상하이 푸둥 동방명주 & 자기부상',
        description: '초고속 자기부상열차와 사이버 마천루',
        bgGradient: 'from-rose-950 via-purple-950 to-zinc-950',
        skyIcons: ['🚄', '🛸'],
        landmarks: '🗼 동방명주 & 푸둥 마천루',
        elements: [
          { icon: '🗼', name: '동방명주타워', extraClass: 'text-2xl' },
          { icon: '🚄', name: '초고속자기부상', extraClass: 'animate-bounce' },
          { icon: '🏙️', name: '스마트도시' },
          { icon: '🌐', name: 'AI관제' },
        ],
      },
      {
        tierTitle: '내몽골·신장 희토류 노천 채굴',
        description: '지하 깊숙이 희귀 광물을 긁어모으는 초대형 굴착',
        bgGradient: 'from-red-950 via-red-900 to-black',
        skyIcons: ['🔥', '💥'],
        landmarks: '🌋 희토류 메가 노천광산',
        elements: [
          { icon: '⚙️', name: '메가드릴', extraClass: 'animate-spin' },
          { icon: '🌋', name: '노천분화구' },
          { icon: '💥', name: '다이너마이트', extraClass: 'animate-ping' },
          { icon: '🔥', name: '용광로' },
        ],
      },
    ],
  },
  'team-3': {
    flag: '🇮🇳',
    landmark: '타지마할 & 첨단 IT 밸리',
    engName: 'India',
    bgGradient: 'from-amber-950 via-stone-900 to-zinc-950',
    accentColor: '#F59E0B',
    tierScenes: [
      {
        tierTitle: '갠지스강변 야자수와 전통 공예',
        description: '풍요로운 강변과 손으로 짓는 면직물 마을',
        bgGradient: 'from-amber-200 via-sky-300 to-emerald-600',
        skyIcons: ['☀️', '🌴'],
        landmarks: '🕌 갠지스강변 마을',
        elements: [
          { icon: '🌴', name: '야자수' },
          { icon: '🕌', name: '전통사원', extraClass: 'text-2xl' },
          { icon: '🧵', name: '전통물레' },
          { icon: '🌾', name: '농경지' },
        ],
      },
      {
        tierTitle: '식민지 초기 철도 & 증기 방적소',
        description: '증기 엔진으로 돌아가는 뭄바이 직물 공장',
        bgGradient: 'from-stone-600 via-orange-950/70 to-stone-900',
        skyIcons: ['💨', '☁️'],
        landmarks: '🚂 뭄바이 초기 철도',
        elements: [
          { icon: '🚂', name: '증기기관차', extraClass: 'text-2xl' },
          { icon: '⚙️', name: '방적기계' },
          { icon: '🏭', name: '면직공장' },
          { icon: '💨', name: '석탄연무' },
        ],
      },
      {
        tierTitle: '구자라트 석유화학 & 제철 단지',
        description: '끝없이 피어오르는 화학 플랜트 연기',
        bgGradient: 'from-zinc-700 via-orange-950 to-zinc-950',
        skyIcons: ['🏭', '🌫️'],
        landmarks: '🛢️ 중화학 콤비나트',
        elements: [
          { icon: '🛢️', name: '정유탱크' },
          { icon: '🏭', name: '석유화학단지', extraClass: 'text-2xl' },
          { icon: '🏗️', name: '항만크레인' },
          { icon: '🌫️', name: '화학스모그' },
        ],
      },
      {
        tierTitle: '벵갈루루 글로벌 IT 밸리',
        description: '전 세계 소프트웨어와 데이터 센터 라인',
        bgGradient: 'from-blue-950 via-indigo-950 to-zinc-950',
        skyIcons: ['⚡', '💻'],
        landmarks: '🏢 벵갈루루 테크파크',
        elements: [
          { icon: '💻', name: '소프트웨어랩' },
          { icon: '🤖', name: 'AI로봇', extraClass: 'animate-pulse text-2xl' },
          { icon: '📡', name: '통신위성망' },
          { icon: '⚡', name: '데이터서버' },
        ],
      },
      {
        tierTitle: '스마트 메가시티 & 찬드라얀 기지',
        description: '달 탐사 우주 센터와 하이테크 미래 도시',
        bgGradient: 'from-amber-950 via-purple-950 to-zinc-950',
        skyIcons: ['🛰️', '✨'],
        landmarks: '🕌 타지마할 & 우주센터',
        elements: [
          { icon: '🕌', name: '타지마할', extraClass: 'text-2xl' },
          { icon: '🛰️', name: '찬드라얀위성', extraClass: 'animate-bounce' },
          { icon: '🏙️', name: '초고층빌딩' },
          { icon: '🚀', name: '우주로켓' },
        ],
      },
      {
        tierTitle: '데칸 고원 연속 메가 광물 채굴',
        description: '지각 중심부의 보크사이트와 철광석 극한 채굴',
        bgGradient: 'from-red-950 via-orange-950 to-black',
        skyIcons: ['🔥', '💥'],
        landmarks: '🌋 데칸 메가 시추 리그',
        elements: [
          { icon: '⚙️', name: '연속굴착기', extraClass: 'animate-spin' },
          { icon: '🌋', name: '지각균열' },
          { icon: '🔥', name: '용암불꽃', extraClass: 'animate-bounce' },
          { icon: '⚡', name: '핵심코어' },
        ],
      },
    ],
  },
  'team-4': {
    flag: '🇯🇵',
    landmark: '후지산 & 하이테크 테크노폴리스',
    engName: 'Japan',
    bgGradient: 'from-emerald-950 via-slate-900 to-zinc-950',
    accentColor: '#10B981',
    tierScenes: [
      {
        tierTitle: '후지산 아래 벚꽃과 전통 가옥',
        description: '만개한 벚꽃과 고즈넉한 목조 마을',
        bgGradient: 'from-rose-200 via-sky-300 to-emerald-600',
        skyIcons: ['🌸', '☀️'],
        landmarks: '🗻 후지산 절경',
        elements: [
          { icon: '🗻', name: '후지산', extraClass: 'text-2xl' },
          { icon: '🌸', name: '벚꽃나무' },
          { icon: '⛩️', name: '전통신사' },
          { icon: '🍵', name: '목조가옥' },
        ],
      },
      {
        tierTitle: '메이지 유신 야와타 제철소',
        description: '근대화의 시작을 알리는 증기선과 용광로',
        bgGradient: 'from-stone-600 via-slate-800 to-stone-900',
        skyIcons: ['💨', '☁️'],
        landmarks: '🚢 요코하마 개항장',
        elements: [
          { icon: '🚢', name: '증기기선' },
          { icon: '🏭', name: '근대제철소', extraClass: 'text-2xl' },
          { icon: '⚙️', name: '철강롤러' },
          { icon: '💨', name: '용광로연무' },
        ],
      },
      {
        tierTitle: '도쿄만 게이힌 공업 콤비나트',
        description: '바다를 메운 공장들과 끝없는 불빛',
        bgGradient: 'from-zinc-700 via-teal-950 to-zinc-950',
        skyIcons: ['🏭', '🌫️'],
        landmarks: '🗼 도쿄타워 & 공업만',
        elements: [
          { icon: '🏗️', name: '도크설비' },
          { icon: '🏭', name: '석유화학플랜트', extraClass: 'text-2xl' },
          { icon: '🛢️', name: '가스탱크' },
          { icon: '🌫️', name: '임해스모그' },
        ],
      },
      {
        tierTitle: '신칸센 & 정밀 산업 로봇',
        description: '오차 없는 정밀 제어 로봇 공정과 고속철도',
        bgGradient: 'from-cyan-950 via-slate-900 to-zinc-950',
        skyIcons: ['🚄', '⚡'],
        landmarks: '🚄 신칸센 고속선로',
        elements: [
          { icon: '🚄', name: '신칸센열차', extraClass: 'animate-bounce' },
          { icon: '🦾', name: '정밀로봇팔', extraClass: 'animate-pulse text-2xl' },
          { icon: '🤖', name: '반도체로봇' },
          { icon: '⚡', name: '초정밀라인' },
        ],
      },
      {
        tierTitle: '시부야 사이버네틱 스마트 타워',
        description: '입체 홀로그램과 인공지능 미래 도시',
        bgGradient: 'from-indigo-950 via-purple-950 to-zinc-950',
        skyIcons: ['✨', '🛸'],
        landmarks: '🗼 시부야 미래 스카이라인',
        elements: [
          { icon: '🗼', name: '도쿄스마트타워', extraClass: 'text-2xl' },
          { icon: '🏙️', name: '홀로그램빌딩' },
          { icon: '🛸', name: '비행셔틀' },
          { icon: '🌐', name: '스마트그리드' },
        ],
      },
      {
        tierTitle: '난카이 해구 해저 메탄 채굴',
        description: '태평양 해저 수천 미터를 뚫는 불타는 얼음 채굴선',
        bgGradient: 'from-teal-950 via-blue-950 to-black',
        skyIcons: ['🌊', '⚡'],
        landmarks: '🌋 해저 메탄하이드레이트 기지',
        elements: [
          { icon: '⚙️', name: '해저드릴', extraClass: 'animate-spin' },
          { icon: '🌊', name: '심해소용돌이' },
          { icon: '🔥', name: '메탄화염', extraClass: 'animate-bounce' },
          { icon: '⚡', name: '심해발전' },
        ],
      },
    ],
  },
  'team-5': {
    flag: '🇫🇷',
    landmark: '에펠탑 & 신재생·원자력 단지',
    engName: 'France',
    bgGradient: 'from-purple-950 via-slate-900 to-zinc-950',
    accentColor: '#8B5CF6',
    tierScenes: [
      {
        tierTitle: '프로방스 라벤더 & 센강 풍차',
        description: '보랏빛 향기 가득한 언덕과 포도밭 풍차',
        bgGradient: 'from-purple-200 via-sky-300 to-emerald-600',
        skyIcons: ['☀️', '🍇'],
        landmarks: '🏰 루아르 고성',
        elements: [
          { icon: '🍇', name: '포도밭' },
          { icon: '🏰', name: '중세고성', extraClass: 'text-2xl' },
          { icon: '🌾', name: '밀밭' },
          { icon: '🪵', name: '목공예' },
        ],
      },
      {
        tierTitle: '낭트 증기 방직소 & 19세기 기차',
        description: '산업혁명을 맞이한 센강변의 증기 기계',
        bgGradient: 'from-stone-600 via-purple-950/70 to-stone-900',
        skyIcons: ['💨', '☁️'],
        landmarks: '🚂 파리 북역 증기열차',
        elements: [
          { icon: '🚂', name: '증기기관차', extraClass: 'text-2xl' },
          { icon: '⚙️', name: '철도엔진' },
          { icon: '🏭', name: '방직공장' },
          { icon: '💨', name: '연무' },
        ],
      },
      {
        tierTitle: '론 계곡 중화학 단지 & 에펠탑',
        description: '에펠탑 주변을 둘러싼 대규모 중화학 굴뚝',
        bgGradient: 'from-zinc-700 via-purple-950 to-zinc-950',
        skyIcons: ['🏭', '🌫️'],
        landmarks: '🗼 에펠탑 & 공업단지',
        elements: [
          { icon: '🗼', name: '에펠탑', extraClass: 'text-2xl' },
          { icon: '🏭', name: '화학단지' },
          { icon: '🛢️', name: '원유탱크' },
          { icon: '🌫️', name: '산업스모그' },
        ],
      },
      {
        tierTitle: '툴루즈 에어버스 항공 로봇 라인',
        description: '최첨단 항공기와 우주 발사체 자동화 라인',
        bgGradient: 'from-blue-950 via-purple-950 to-zinc-950',
        skyIcons: ['✈️', '⚡'],
        landmarks: '✈️ 에어버스 조립공장',
        elements: [
          { icon: '✈️', name: '대형여객기', extraClass: 'animate-bounce' },
          { icon: '🦾', name: '조립로봇팔', extraClass: 'animate-pulse text-2xl' },
          { icon: '🤖', name: '항공엔지니어' },
          { icon: '⚡', name: '하이테크' },
        ],
      },
      {
        tierTitle: '파리 라데팡스 원자력·미래 도시',
        description: '신개념 개선문과 초현대식 원자력 스마트 타워',
        bgGradient: 'from-purple-950 via-indigo-950 to-zinc-950',
        skyIcons: ['⚛️', '✨'],
        landmarks: '🏛️ 라데팡스 그랑드아르슈',
        elements: [
          { icon: '🏛️', name: '신개선문', extraClass: 'text-2xl' },
          { icon: '⚛️', name: '원자력코어', extraClass: 'animate-spin' },
          { icon: '🏙️', name: '초현대빌딩' },
          { icon: '🛸', name: '전기모빌리티' },
        ],
      },
      {
        tierTitle: '알프스 심층 지열 & 우라늄 초심부 시추',
        description: '지각 판 경계부를 뚫고 들어가는 초고열 채굴',
        bgGradient: 'from-red-950 via-purple-950 to-black',
        skyIcons: ['🔥', '⚡'],
        landmarks: '🌋 알프스 지각 굴착기',
        elements: [
          { icon: '⚙️', name: '심부드릴', extraClass: 'animate-spin' },
          { icon: '🌋', name: '지열분화' },
          { icon: '⚡', name: '고전압플라즈마' },
          { icon: '🔥', name: '핵분열용융' },
        ],
      },
    ],
  },
  'team-6': {
    flag: '🇬🇧',
    landmark: '빅벤 & 산업혁명 발상지',
    engName: 'UK',
    bgGradient: 'from-cyan-950 via-slate-900 to-zinc-950',
    accentColor: '#06B6D4',
    tierScenes: [
      {
        tierTitle: '템스강변 전원 목장과 스톤헨지',
        description: '푸른 언덕과 양 떼가 뛰노는 전원 풍경',
        bgGradient: 'from-sky-300 via-sky-200 to-emerald-600',
        skyIcons: ['☀️', '🐑'],
        landmarks: '🪨 스톤헨지 언덕',
        elements: [
          { icon: '🪨', name: '스톤헨지', extraClass: 'text-2xl' },
          { icon: '🐑', name: '양떼' },
          { icon: '🌾', name: '푸른목초지' },
          { icon: '🪵', name: '통나무' },
        ],
      },
      {
        tierTitle: '산업혁명의 요람! 맨체스터 증기 공장',
        description: '와트의 증기 기관이 뿜어내는 첫 번째 산업 혁명',
        bgGradient: 'from-stone-600 via-zinc-700 to-stone-900',
        skyIcons: ['💨', '☁️'],
        landmarks: '🚂 로켓호 기관차 & 면방직소',
        elements: [
          { icon: '🚂', name: '와트증기차', extraClass: 'text-2xl' },
          { icon: '🏭', name: '붉은벽돌공장' },
          { icon: '⚙️', name: '증기피스톤' },
          { icon: '💨', name: '검은석탄연기' },
        ],
      },
      {
        tierTitle: '런던 피수프 스모그 & 빅벤 공업지대',
        description: '짙은 템스강 스모그와 거대 굴뚝의 그림자',
        bgGradient: 'from-zinc-700 via-slate-800 to-zinc-950',
        skyIcons: ['🌫️', '🏭'],
        landmarks: '🕰️ 빅벤 & 템스강 굴뚝',
        elements: [
          { icon: '🕰️', name: '빅벤시계탑', extraClass: 'text-2xl' },
          { icon: '🏭', name: '런던공장군' },
          { icon: '🌉', name: '타워브리지' },
          { icon: '🌫️', name: '런던스모그' },
        ],
      },
      {
        tierTitle: '롤스로이스 정밀 엔진 & 기계 랩',
        description: '항공 제트 엔진과 정밀 로봇 엔지니어링',
        bgGradient: 'from-cyan-950 via-slate-900 to-zinc-950',
        skyIcons: ['⚙️', '⚡'],
        landmarks: '✈️ 롤스로이스 항공연구소',
        elements: [
          { icon: '⚙️', name: '정밀터빈', extraClass: 'animate-spin text-2xl' },
          { icon: '🦾', name: '자동엔진조립' },
          { icon: '✈️', name: '제트추진' },
          { icon: '⚡', name: '정밀계측' },
        ],
      },
      {
        tierTitle: '런던 더 샤드 & 핀테크 스마트 시티',
        description: '더 샤드 마천루와 글로벌 금융 AI 그리드',
        bgGradient: 'from-blue-950 via-indigo-950 to-zinc-950',
        skyIcons: ['🌐', '✨'],
        landmarks: '🏙️ 더 샤드 & 런던아이',
        elements: [
          { icon: '🏙️', name: '더샤드마천루', extraClass: 'text-2xl' },
          { icon: '🎡', name: '런던아이' },
          { icon: '🌐', name: '금융네트워크' },
          { icon: '🛸', name: '시티드론' },
        ],
      },
      {
        tierTitle: '북해 해상 유전 플랫폼 극한 시추',
        description: '거친 북해 파도 속에서 해저 유전을 쥐어짜는 채굴',
        bgGradient: 'from-teal-950 via-slate-900 to-black',
        skyIcons: ['🌊', '⚡'],
        landmarks: '🌋 북해 브렌트 유전 리그',
        elements: [
          { icon: '⚙️', name: '해양시추탑', extraClass: 'animate-spin' },
          { icon: '🛢️', name: '북해원유' },
          { icon: '🌊', name: '거친북해파도' },
          { icon: '⚡', name: '극한전력' },
        ],
      },
    ],
  },
};

export const WorldCountriesVisual: React.FC<WorldCountriesVisualProps> = ({
  gameState,
  sortedTeams,
}) => {
  const [viewMode, setViewMode] = useState<'panorama' | 'cards'>('panorama');
  const isBlackout = gameState.status === 'blackout';

  // State of the central communal pasture based on resource percentage
  const pastureState =
    gameState.resourcePercent >= 50
      ? {
          title: '풍요로운 공동 목초지 & 자원 우물',
          subtitle: '신선한 풀과 맑은 물이 유지되는 건강한 생태계',
          bgColor: 'from-emerald-950/80 via-emerald-900/40 to-stone-950',
          borderColor: 'border-emerald-500/70 shadow-emerald-950/50',
          wellColor: 'text-cyan-400',
          elements: ['🌿', '🌸', '💧', '🐑', '🐄', '🌾'],
          statusClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60',
        }
      : gameState.resourcePercent >= 20
      ? {
          title: '초원 황폐화 진행 & 자원 감소',
          subtitle: '지나친 방목과 시추로 목초지가 마르고 우물이 감소함',
          bgColor: 'from-amber-950/80 via-amber-900/40 to-stone-950',
          borderColor: 'border-amber-500/70 shadow-amber-950/50',
          wellColor: 'text-amber-400',
          elements: ['🍂', '💨', '🌾', '🐑', '⚠️'],
          statusClass: 'bg-amber-950/90 text-amber-300 border-amber-500/60',
        }
      : gameState.resourcePercent > 0
      ? {
          title: '공유지 붕괴 직전 & 극심한 가뭄',
          subtitle: '초원이 완전히 짓밟히고 우물이 바닥을 드러내는 중',
          bgColor: 'from-rose-950/90 via-red-900/50 to-stone-950',
          borderColor: 'border-rose-500/80 shadow-rose-950/60',
          wellColor: 'text-rose-400',
          elements: ['🏜️', '💨', '⚡', '🦴', '🚨'],
          statusClass: 'bg-rose-950/90 text-rose-300 border-rose-500/60 animate-pulse',
        }
      : {
          title: '마을 전체 마비 & 공유지 전멸',
          subtitle: '자원 0% 완전 고갈로 6개 마을 공장과 전력 영구 정지',
          bgColor: 'from-black via-zinc-950 to-red-950/60',
          borderColor: 'border-red-600/90 shadow-red-950/80',
          wellColor: 'text-red-500',
          elements: ['💀', '⚡', '🔥', '🚨', '❌'],
          statusClass: 'bg-red-950/95 text-red-400 border-red-600/80 animate-bounce',
        };

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Outer Circular Wooden Fence Frame (원형 울타리가 둘러쳐진 마을 외곽 경계) */}
      <div className="relative rounded-[2.5rem] border-4 border-amber-800/80 bg-gradient-to-b from-[#1c1917] via-[#141416] to-[#0a0a0c] p-3 sm:p-5 shadow-2xl overflow-hidden">
        {/* Decorative Top Fence Post Texture & Signboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b-2 border-amber-800/60 gap-3">
          {/* Left: Village Title & Pedagogical Theme */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border-2 border-amber-600/60 flex items-center justify-center text-xl shadow-inner shrink-0">
              🏡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>지구촌 6대 국가 실시간 발전 현장</span>
                </h3>
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-700/60 flex items-center gap-1 shadow-xs">
                  <Trees className="w-3 h-3 text-emerald-400" />
                  <span>원형 울타리 공유지 마을</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                둥그런 울타리가 둘러쳐진 하나의 마을 안에서 6개 국가가 공동 자원을 사용하며 경쟁합니다
              </p>
            </div>
          </div>

          {/* Right: View Mode Switcher & Total Score */}
          <div className="flex items-center space-x-3 self-end sm:self-auto">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-zinc-900/90 border border-zinc-700/70 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => setViewMode('panorama')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === 'panorama'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="원형 울타리 마을 전경도 보기"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>원형 마을 전경</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  viewMode === 'cards'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="모둠별 상세 구역 카드 보기"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>구역별 상세</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center space-x-1 text-xs font-bold text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <span>총 발전도:</span>
              <strong className="text-amber-400 font-mono text-sm">
                {Math.round(
                  Object.values(gameState.teams).reduce((s, t) => s + t.score, 0)
                ).toLocaleString()}{' '}
                pts
              </strong>
            </div>
          </div>
        </div>

        {/* VIEW 1: 원형 울타리 마을 전경도 (Circular Fenced Village Panorama) */}
        {viewMode === 'panorama' ? (
          <div className="relative py-2 sm:py-4">
            {/* Outer Circular Fence Boundary Graphic */}
            <div className="relative mx-auto max-w-5xl rounded-[3rem] border-4 border-dashed border-amber-700/60 bg-gradient-to-b from-stone-900/70 via-zinc-900/90 to-stone-950 p-4 sm:p-6 shadow-inner">
              {/* Wooden Fence Posts along top and bottom */}
              <div className="absolute -top-3 left-8 right-8 flex justify-between pointer-events-none select-none text-xs text-amber-700">
                <span>🪵</span>
                <span>🌾</span>
                <span>🪵</span>
                <span>🚪 마을 북문 🚪</span>
                <span>🪵</span>
                <span>🌾</span>
                <span>🪵</span>
              </div>

              {/* CENTER COMMONS: 마을 중앙 공유 목초지 & 자원 우물 */}
              <div className="mb-6 flex flex-col items-center justify-center">
                <div
                  className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 ${pastureState.borderColor} bg-gradient-to-b ${pastureState.bgColor} flex flex-col items-center justify-center p-3 text-center transition-all duration-500 shadow-2xl`}
                >
                  {/* Circular Fence Ring around Pasture */}
                  <div className="absolute inset-1 rounded-full border-2 border-dashed border-amber-600/40 pointer-events-none" />

                  {/* Water Well / Resource Icon */}
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-3xl sm:text-4xl mb-1 select-none animate-bounce">
                      {isBlackout ? '💀' : '💧'}
                    </span>
                    <span className="text-xs font-black text-white tracking-wider">
                      마을 공동 자원 우물
                    </span>
                    <div className="text-2xl sm:text-3xl font-black font-mono my-0.5 text-white drop-shadow">
                      {gameState.resourcePercent}%
                    </div>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${pastureState.statusClass}`}
                    >
                      {pastureState.title.split('&')[0]}
                    </span>
                  </div>

                  {/* Grazing Animals & Flora inside Commons */}
                  <div className="absolute inset-0 flex items-center justify-around pointer-events-none text-sm opacity-80">
                    <span className="absolute top-2 left-6">{pastureState.elements[0]}</span>
                    <span className="absolute top-3 right-6">{pastureState.elements[1]}</span>
                    <span className="absolute bottom-3 left-7">{pastureState.elements[2]}</span>
                    <span className="absolute bottom-2 right-7">{pastureState.elements[3]}</span>
                  </div>
                </div>

                <p className="text-[11px] text-amber-300/90 font-medium mt-2 text-center bg-black/40 px-3 py-1 rounded-full border border-amber-900/50">
                  {pastureState.subtitle}
                </p>
              </div>

              {/* 6 COUNTRY FENCED VILLAGE DISTRICTS (6개국 원형 울타리 구역들) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 relative z-10">
                {Object.keys(gameState.teams).map((tid) => {
                  const team = gameState.teams[tid];
                  const rank = sortedTeams.findIndex((t) => t.id === tid) + 1;
                  const currentUpgrade =
                    UPGRADES.find((u) => u.id === team.currentUpgradeId) || UPGRADES[0];
                  const tierIndex = Math.max(
                    0,
                    Math.min(5, UPGRADES.findIndex((u) => u.id === team.currentUpgradeId))
                  );
                  const countryMeta =
                    COUNTRY_DETAILS[tid] || COUNTRY_DETAILS['team-1'];
                  const scene = countryMeta.tierScenes[tierIndex];
                  const isFirstPlace = rank === 1 && team.score > 0;

                  return (
                    <div
                      key={tid}
                      className={`rounded-3xl border-2 transition-all duration-300 p-3 flex flex-col justify-between relative overflow-hidden shadow-lg ${
                        isFirstPlace
                          ? 'border-amber-500/90 bg-stone-900/95 ring-2 ring-amber-500/50 shadow-amber-950/50'
                          : 'border-amber-800/60 bg-stone-900/80 hover:border-amber-700/80'
                      } ${isBlackout ? 'grayscale-70 border-red-900/80' : ''}`}
                    >
                      {/* Fenced District Header */}
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-900/50">
                        <div className="flex items-center space-x-2 min-w-0">
                          {/* Authentic SVG Country Flag */}
                          <CountryFlag countryId={tid} size="md" rounded="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-xs sm:text-sm font-black text-white truncate">
                                {team.name}
                              </h4>
                              {isFirstPlace && (
                                <span className="text-[9px] font-extrabold bg-amber-500 text-black px-1.5 py-0.2 rounded-full shrink-0 flex items-center gap-0.5">
                                  <Trophy className="w-2.5 h-2.5 fill-black" /> 1위
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-amber-200/70 font-mono block">
                              울타리 구역 #{rank}위
                            </span>
                          </div>
                        </div>

                        {/* District Score */}
                        <div className="text-right shrink-0">
                          <div
                            className="text-sm sm:text-base font-black font-mono"
                            style={{ color: team.color }}
                          >
                            {Math.round(team.score).toLocaleString()}
                            <span className="text-[9px] font-normal text-zinc-400 ml-0.5">pts</span>
                          </div>
                          <div className="text-[10px] text-amber-400 font-mono">
                            {team.tapCount.toLocaleString()} 클릭
                          </div>
                        </div>
                      </div>

                      {/* Mini Village Diorama inside Fenced District */}
                      <div className="my-1">
                        {isBlackout ? (
                          <div className="h-24 rounded-2xl bg-zinc-950 border border-red-900/60 flex flex-col items-center justify-center p-2 text-center">
                            <ShieldAlert className="w-6 h-6 text-red-500 mb-1 animate-bounce" />
                            <span className="text-[11px] font-black text-red-400">
                              ⚡ 마을 전력 전면 차단
                            </span>
                            <span className="text-[9px] text-zinc-500">
                              우물 고갈로 공장 및 기계 정지
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`h-24 rounded-2xl bg-gradient-to-b ${scene.bgGradient} border border-amber-900/50 p-2 flex flex-col justify-between relative overflow-hidden shadow-inner`}
                          >
                            {/* Top Village Landmark Badge */}
                            <div className="flex items-center justify-between text-[9px] font-bold z-10">
                              <span className="bg-black/60 px-2 py-0.5 rounded-md text-zinc-200">
                                {scene.landmarks}
                              </span>
                              <div className="flex space-x-1 text-xs">
                                {scene.skyIcons.map((ic, i) => (
                                  <span key={i}>{ic}</span>
                                ))}
                              </div>
                            </div>

                            {/* Village Scene Elements (Homes, Fences, Smoke, Factories) */}
                            <div className="flex items-end justify-around pb-0.5 text-base z-10">
                              {scene.elements.map((el, i) => (
                                <div
                                  key={i}
                                  className={`flex flex-col items-center select-none ${
                                    el.extraClass || ''
                                  }`}
                                  title={el.name}
                                >
                                  <span>{el.icon}</span>
                                  <span className="text-[8px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                    {el.name}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Fenced Footrail */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-800/80" />
                          </div>
                        )}
                      </div>

                      {/* Technology Stage & Progress Bar */}
                      <div className="mt-1.5 pt-1 border-t border-amber-900/40 flex items-center justify-between text-[10px]">
                        <span className="font-bold text-zinc-300 truncate max-w-[130px]">
                          Lv.{tierIndex + 1} {scene.tierTitle.split('&')[0]}
                        </span>
                        <span className="font-mono font-bold text-amber-400 shrink-0">
                          +{currentUpgrade.pointsPerTap}/클릭
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wooden Fence Posts along bottom */}
              <div className="absolute -bottom-3 left-8 right-8 flex justify-between pointer-events-none select-none text-xs text-amber-700">
                <span>🪵</span>
                <span>🌾</span>
                <span>🪵</span>
                <span>🚪 마을 남문 🚪</span>
                <span>🪵</span>
                <span>🌾</span>
                <span>🪵</span>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: 구역별 상세 디오라마 뷰 (Fenced Village District Cards) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {Object.keys(gameState.teams).map((tid) => {
              const team = gameState.teams[tid];
              const rank = sortedTeams.findIndex((t) => t.id === tid) + 1;
              const currentUpgrade =
                UPGRADES.find((u) => u.id === team.currentUpgradeId) || UPGRADES[0];
              const tierIndex = Math.max(
                0,
                Math.min(5, UPGRADES.findIndex((u) => u.id === team.currentUpgradeId))
              );
              const countryMeta =
                COUNTRY_DETAILS[tid] || COUNTRY_DETAILS['team-1'];
              const scene = countryMeta.tierScenes[tierIndex];
              const isFirstPlace = rank === 1 && team.score > 0;

              // Next upgrade info for progress visualization
              const nextUpgrade = UPGRADES[tierIndex + 1];
              const prevCost = currentUpgrade.cost;
              const nextCost = nextUpgrade ? nextUpgrade.cost : currentUpgrade.cost * 1.5;
              const progressPercent = nextUpgrade
                ? Math.min(
                    100,
                    Math.max(
                      0,
                      Math.round(
                        ((team.score - prevCost) / Math.max(1, nextCost - prevCost)) *
                          100
                      )
                    )
                  )
                : 100;

              return (
                <div
                  key={tid}
                  className={`rounded-3xl border-2 transition-all duration-300 relative overflow-hidden flex flex-col p-3.5 shadow-lg ${
                    isFirstPlace
                      ? 'bg-stone-900/95 border-amber-500/90 shadow-amber-950/50 ring-2 ring-amber-500/50'
                      : 'bg-stone-900/80 border-amber-800/60 hover:border-amber-700/80'
                  } ${isBlackout ? 'grayscale-70 border-red-900' : ''}`}
                >
                  {/* Decorative Rustic Fence Beam on Card Top */}
                  <div className="flex items-center justify-between text-[10px] text-amber-700/80 font-mono mb-1 pb-1 border-b border-amber-900/40">
                    <span>🪵-☲-☲-🪵 울타리 구역</span>
                    <span>#{rank}위 모둠</span>
                  </div>

                  {/* Card Top: Country Name with SVG Flag & Rank Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CountryFlag countryId={tid} size="lg" rounded="sm" />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-sm font-black text-white tracking-tight">
                            {team.name}
                          </h4>
                          {isFirstPlace && (
                            <span className="text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shadow">
                              <Trophy className="w-2.5 h-2.5 fill-black" /> 1위 선두
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 block font-medium">
                          {countryMeta.landmark}
                        </span>
                      </div>
                    </div>

                    {/* Score & Rank */}
                    <div className="text-right">
                      <div
                        className="text-base font-black font-mono"
                        style={{ color: team.color }}
                      >
                        {Math.round(team.score).toLocaleString()}
                        <span className="text-[10px] font-normal text-zinc-400 ml-0.5">
                          pts
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-400 font-semibold">
                        <span>{rank}위</span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-amber-400 font-mono">
                          {team.tapCount.toLocaleString()} 클릭
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Unique Country Diorama Scene */}
                  <div className="my-1.5">
                    {isBlackout ? (
                      <div className="relative w-full h-32 sm:h-36 bg-zinc-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-red-900/60 p-2 text-center">
                        <div className="absolute inset-0 bg-red-950/20 animate-pulse pointer-events-none" />
                        <ShieldAlert className="w-8 h-8 text-red-500 mb-1 animate-bounce" />
                        <span className="text-xs font-black text-red-400 tracking-wider">
                          ⚡ 전력 마비 / 기계 정지
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">
                          마을 우물 0% 고갈로 {team.name} 공장 전면 셧다운
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden bg-gradient-to-b ${scene.bgGradient} border border-amber-900/50 flex flex-col justify-between p-2 shadow-inner`}
                      >
                        {/* Sky icons & country landmark badge */}
                        <div className="relative z-10 flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold bg-black/60 backdrop-blur-xs text-zinc-200 px-2 py-0.5 rounded-md border border-white/10">
                            {scene.landmarks}
                          </span>
                          <div className="flex items-center space-x-1 text-sm">
                            {scene.skyIcons.map((ic, i) => (
                              <span key={i}>{ic}</span>
                            ))}
                          </div>
                        </div>

                        {/* Animated elements representing the country's tier */}
                        <div className="relative z-10 flex items-end justify-around pb-1 text-lg">
                          {scene.elements.map((el, i) => (
                            <div
                              key={i}
                              className={`flex flex-col items-center select-none ${
                                el.extraClass || ''
                              }`}
                              title={el.name}
                            >
                              <span>{el.icon}</span>
                              <span className="text-[9px] font-bold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                {el.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Scene Stage Title Banner */}
                        <div className="relative z-10 text-center bg-black/70 backdrop-blur-xs py-0.5 px-2 rounded-lg text-[10px] font-black text-white flex items-center justify-between border border-white/10">
                          <span className="text-amber-300">
                            Lv.{tierIndex + 1} {scene.tierTitle}
                          </span>
                          <span className="text-zinc-300 text-[9px] font-normal truncate max-w-[140px]">
                            {scene.description}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visual Development Level & Progress Gauge */}
                  <div className="mt-1.5 space-y-1.5">
                    {/* 6-Tier Step Visual Indicator */}
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-zinc-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>발전 단계:</span>
                        <strong className="text-white">
                          Lv.{tierIndex + 1} / 6
                        </strong>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {nextUpgrade ? (
                          <>다음: {nextUpgrade.cost.toLocaleString()} pts</>
                        ) : (
                          <span className="text-amber-400 font-bold">★ 최고 레벨</span>
                        )}
                      </span>
                    </div>

                    {/* Segmented Level Bar (6 blocks) */}
                    <div className="grid grid-cols-6 gap-1 h-1.5 w-full">
                      {[0, 1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`h-full rounded-full transition-all duration-300 ${
                            lvl < tierIndex
                              ? 'bg-indigo-500 shadow-sm'
                              : lvl === tierIndex
                              ? 'bg-amber-400 shadow-md shadow-amber-500/50 animate-pulse'
                              : 'bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Score Growth Progress Bar */}
                    <div className="relative w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: team.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Card Footer: Current Technology & Output */}
                  <div className="mt-2 pt-2 border-t border-amber-900/40 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="text-[11px] font-bold text-zinc-200 truncate">
                        {currentUpgrade.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] font-mono shrink-0 pl-1">
                      <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-amber-300 font-bold">
                        +{currentUpgrade.pointsPerTap}
                      </span>
                      <span className="text-zinc-500 text-[9px]">/클릭</span>
                      {currentUpgrade.passivePointsPerSec > 0 && (
                        <span className="text-emerald-400 text-[10px] pl-0.5">
                          (+{currentUpgrade.passivePointsPerSec}/초)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
