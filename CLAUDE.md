# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

학원 시간표 관리 애플리케이션 (Time Manager)으로, 초등/중등/고등부 학생 관리, 시간표 설정, 입출금 관리 기능을 제공하는 React 기반 프론트엔드 프로젝트입니다.

## 주요 명령어

```bash
# 개발 서버 실행 (포트: 5175)
npm run dev

# 프로덕션 빌드 (TypeScript 컴파일 포함)
npm run build

# 린트 실행
npm run lint

# 빌드된 앱 미리보기
npm run preview
```

## 기술 스택

- **프레임워크**: React 19.2 + TypeScript
- **빌드 도구**: Vite 7.2 (SWC 사용)
- **스타일링**: Tailwind CSS 4.1
- **라우팅**: React Router DOM 7.12
- **아이콘**: React Icons

## 아키텍처 구조

### 라우팅 구조

- `Layout` 컴포넌트가 모든 페이지의 공통 레이아웃 제공 (Header + Outlet)
- `App.tsx`에서 7개의 주요 라우트 정의:
  - `/`: 홈페이지
  - `/elementary`, `/middle`, `/high`: 학년별 수업 관리 페이지
  - `/schedule`: 시간표 관리 (요일별/선생님별 뷰 전환)
  - `/inout`: 신입/중퇴 학생 관리
  - `/payment`: 입금 명단 관리

### 컴포넌트 패턴

**ClassTable 기반 구조**:

- `ElementaryPage`, `MiddlePage`, `HighPage`는 동일한 구조를 공유
- 각 페이지는 `ClassTable` 컴포넌트의 배열을 관리
- `ClassTable` 내부에서 `StudentRowInClassTable` 컴포넌트 배열 관리
- 학년 레벨: 초등(E) 1-6, 중등/고등(M/H) 1-3 순환

**TimeTable 기반 구조**:

- `SchedulePage`는 두 가지 뷰 모드 제공:
  - 요일별 뷰: 7개의 `TimeTable` 컴포넌트 (월-일)
  - 선생님별 뷰: `TeacherTable` 컴포넌트
- 시간 설정, 행 설정, 열 설정 모드 지원
- `SetTimeModal`을 통한 시간 초기값 설정

### 상태 관리

- 전역 상태 관리 라이브러리 사용 안함
- 각 페이지에서 로컬 상태(useState)로 데이터 관리
- ID 기반 항목 관리 패턴 일관성 유지:
  - `nextId` state로 고유 ID 생성
  - 삭제: `filter()` 사용
  - 수정: `map()` 사용
- 정렬 시 `tableId` 재할당하여 순서 재정의

### 타입 정의

- `src/util/interfaces.ts`에 공용 인터페이스 정의
- `IClassTable`: 수업 테이블 정보 (tableId, currentLevel)
- `IStudentRowsInClassTable`: 학생 행 정보 (studentId, idx, name, school, grade)

### UI/UX 패턴

- 삭제 작업 시 `confirm()` 다이얼로그로 확인
- 버튼 활성화 상태는 `font-bold` 클래스로 표시
- Tailwind 유틸리티 클래스 중심 스타일링
- 반응형 레이아웃: flexbox 기반 (ClassTable은 `flex-wrap`으로 그리드 형성)

## 개발 시 주의사항

- **네이밍**: camelCase 사용 (변수명, 함수명)
- **스타일링**: Tailwind CSS만 사용, 별도 CSS 파일 최소화
- **주석/커밋**: 한국어 사용
- **컴포넌트 재사용**: ElementaryPage, MiddlePage, HighPage의 중복 로직 인지 필요
