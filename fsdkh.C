#include <stdio.h>

int main() {
    int arr[6];
    int max, min;

    printf("6개의 정수를 입력:\n");
    for (int i = 0; i < 6; i++) {
        printf("arr[%d] = ", i);
        scanf("%d", &arr[i]);
    }

    max = min = arr[0];

    for (int i = 1; i < 6; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
        if (arr[i] < min) {
            min = arr[i];
        }
    }

    printf("최대값: %d\n", max);
    printf("최소값: %d\n", min);

    return 0;
}