num = input("6자리 숫자를 입력하세요: ")


if len(num) == 6 and num.isdigit():
    six_sum = sum(int(d) for d in num)
    if six_sum >= 30:
        print("30 이상입니다.")
    else:
        print("30 미만입니다.")
else:
    print("6자리 숫자를 정확히 입력해 주세요.")



code = input()
strip_code = code.strip()


if strip_code:
    print(strip_code)
else:
    print("공백없음")