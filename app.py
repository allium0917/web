# 주요 라이브러리 임포트
import streamlit as st  # Streamlit 대시보드 UI 라이브러리
import pandas as pd  # 데이터프레임 처리 라이브러리
import plotly.express as px  # 인터랙티브 시각화 라이브러리
import matplotlib.pyplot as plt  # 정적 그래프 라이브러리
import seaborn as sns  # 통계적 시각화 지원
import io  # 파일 저장용 버퍼

# 대시보드 설정 및 제목 출력
st.set_page_config(page_title="전적 분석 대시보드", layout="wide")
st.title("📊 전적 분석 대시보드")

# CSV, JSON, JSONL 파일 업로드 받기
uploaded_file = st.file_uploader("CSV, JSON, JSONL 파일을 업로드하세요", type=["csv", "json", "jsonl"])

# 파일 업로드 후 데이터 로드
if uploaded_file:
    if uploaded_file.name.endswith('.csv'):
        df = pd.read_csv(uploaded_file)  # CSV 파일 불러오기
    elif uploaded_file.name.endswith('.jsonl'):
        df = pd.read_json(uploaded_file, lines=True)  # JSONL 포맷 불러오기
    elif uploaded_file.name.endswith('.json'):
        import json
        try:
            import io
            raw_json = json.load(io.TextIOWrapper(uploaded_file, encoding='utf-8'))
            if isinstance(raw_json, dict):
                df = pd.json_normalize(raw_json)  # 딕셔너리인 경우 평탄화
            elif isinstance(raw_json, list):
                df = pd.DataFrame(raw_json)  # 리스트인 경우 바로 DataFrame
            else:
                st.error("지원하지 않는 JSON 구조입니다.")
                st.stop()
        except Exception as e:
            st.error(f"JSON 파일을 불러오는 중 오류 발생: {e}")
            st.stop()

    # 컬럼명 공백 제거
    df.columns = df.columns.str.strip()

    # 수치형 컬럼 추출
    numeric_cols = df.select_dtypes(include='number').columns.tolist()

    # 원본 데이터 확인 체크박스
    if st.checkbox("📑 전체 원본 데이터 보기"):
        st.dataframe(df)

    # --- 사이드바 필터 영역 ---
    st.sidebar.header("📌 필터 조건")

    # 리그 필터
    if 'league' in df.columns:
        league_options = df['league'].dropna().unique().tolist()
        selected_leagues = st.sidebar.multiselect("리그 선택", league_options, default=league_options)
    else:
        selected_leagues = []

    # 연도 필터
    if 'year' in df.columns:
        year_options = sorted(df['year'].dropna().unique().tolist())
        selected_years = st.sidebar.multiselect("연도 선택", year_options, default=year_options)
    else:
        selected_years = []

    # 리그+연도 기준 필터 적용
    if 'league' in df.columns and 'year' in df.columns:
        df = df[
            df['league'].isin(selected_leagues) &
            df['year'].isin(selected_years)
        ]

    # 선수/팀 목록 추출
    if 'playername' in df.columns:
        available_players = df['playername'].dropna().unique().tolist()
    else:
        available_players = []
        st.warning("⚠️ 'playername' 컬럼이 없어 선수 기준 분석이 제한됩니다.")

    if 'teamname' in df.columns:
        available_teams = df['teamname'].dropna().unique().tolist()
    else:
        available_teams = []
        st.warning("⚠️ 'teamname' 컬럼이 없어 팀 기준 분석이 제한됩니다.")

    # 분석 기준 (선수/팀)
    st.subheader("🔍 분석 기준 선택")
    analysis_type = st.radio("분석 기준", ["선수 기준", "팀 기준"], horizontal=True)

    analysis_df = pd.DataFrame()
    group_col = None

    # 선택된 기준에 따라 데이터 필터링
    if analysis_type == "선수 기준":
        selected_players = st.multiselect("전적을 보고 싶은 선수를 선택하세요", available_players, default=available_players[:2])
        if selected_players:
            analysis_df = df[df['playername'].isin(selected_players)]
            group_col = 'playername'
    else:
        selected_teams = st.multiselect("전적을 보고 싶은 팀을 선택하세요", available_teams, default=available_teams[:2])
        if selected_teams:
            analysis_df = df[df['teamname'].isin(selected_teams)]
            group_col = 'teamname'

    # --- 본격 분석 영역 ---
    if not analysis_df.empty and group_col:
        st.subheader("📈 지표 비교 시각화")

        # 수치형 지표 선택
        numeric_cols_in_raw = df.select_dtypes(include='number').columns.tolist()
        selected_metrics = st.multiselect("비교할 지표를 선택하세요 (원본 데이터 기준)", numeric_cols_in_raw, default=numeric_cols_in_raw[:3])

        if selected_metrics:
            # 평균값 vs Raw 선택
            display_option = st.radio("표시할 데이터 형태", ["평균값 (요약)", "Raw 레코드"])

            if display_option == "평균값 (요약)":
                raw_grouped = analysis_df.groupby(group_col)[selected_metrics].mean().reset_index()
            elif display_option == "Raw 레코드":
                raw_grouped = analysis_df[[group_col] + selected_metrics].copy()

            # 누적 막대그래프 (고정)
            melted = raw_grouped.melt(id_vars=group_col, var_name='지표', value_name='값')
            chart = px.bar(melted, x=group_col, y='값', color='지표', barmode='stack', title='누적 막대그래프')
            st.plotly_chart(chart, use_container_width=True)

            # CSV 다운로드 버튼
            st.download_button(
                label="📥 분석된 데이터 CSV 다운로드",
                data=raw_grouped.to_csv(index=False).encode('utf-8-sig'),
                file_name="분석결과.csv",
                mime="text/csv"
            )

            # 상관계수 분석 (평균값만 가능)
            if display_option == "평균값 (요약)":
                if len(selected_metrics) >= 2:
                    corr_df = raw_grouped[selected_metrics].dropna().corr().round(3)
                    if not corr_df.empty:
                        st.subheader("📈 지표 간 상관계수")
                        st.dataframe(corr_df)
                        st.subheader("🧊 상관관계 히트맵")
                        fig, ax = plt.subplots(figsize=(8, 6))
                        sns.heatmap(corr_df, annot=True, cmap='coolwarm', vmin=-1, vmax=1, ax=ax, annot_kws={"size": 10})
                        st.pyplot(fig)
                        buf = io.BytesIO()
                        fig.savefig(buf, format="png")
                        st.download_button(
                            label="🖼️ 히트맵 PNG 다운로드",
                            data=buf.getvalue(),
                            file_name="correlation_heatmap.png",
                            mime="image/png"
                        )
                    else:
                        st.warning("상관관계를 계산할 수 있는 지표가 없습니다. 선택된 지표에 값이 부족합니다.")
                else:
                    st.warning("상관관계 분석을 위해 최소 2개의 지표를 선택해주세요.")

            # 정렬 옵션 추가
            sort_metric = st.selectbox("📌 정렬 기준 선택", selected_metrics)
            sorted_raw = raw_grouped.sort_values(by=sort_metric, ascending=False).reset_index(drop=True)
            st.subheader(f"📋 {sort_metric} 기준 정렬 결과")
            st.dataframe(sorted_raw)

        # --- 조건 기반 평균값 분석 기능
        st.subheader("🧮 조건 기반 평균값 분석")
        condition_col = st.selectbox("기준 지표를 선택하세요", df.columns, key="cond_col")
        # 조건 값 선택 방식은 컬럼 타입에 따라 분기
        if pd.api.types.is_numeric_dtype(df[condition_col]):
            condition_val = st.number_input("조건 값 입력", value=float(df[condition_col].median()), key="cond_val")
        else:
            condition_val = st.selectbox("조건 값 선택", df[condition_col].dropna().unique(), key="cond_val")
        # 조건 만족 시 비교할 지표 선택
        target_metrics = st.multiselect("평균을 비교할 지표 선택", numeric_cols, key="cond_metrics")
        # 버튼 클릭 시 조건 필터 후 평균값 계산
        if st.button("조건 적용하여 평균 계산") and target_metrics:
            filtered_df = analysis_df[analysis_df[condition_col] == condition_val]
            if not filtered_df.empty:
                result = filtered_df.groupby(group_col)[target_metrics].mean().reset_index()
                st.dataframe(result, use_container_width=True)
            else:
                st.warning("조건을 만족하는 데이터가 없습니다.")
