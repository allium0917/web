#include <stdio.h>

int main() {
    long long total, rank;
    scanf("%lld %lld", &total, &rank);

    if (rank > total) {
        printf("잘못된 입력입니다\n");
        return 0;
    }

    long long cutoff = total / 10;
    if (cutoff == 0) cutoff = 1; 

    if (rank <= cutoff) {
        printf("코딩 마스터 %lld등\n", rank);
    } else {
        printf("코딩 마스터 전단계 %lld등\n", rank);
    }

    return 0;
}