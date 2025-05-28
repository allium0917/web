document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.track');
  const slides = document.querySelectorAll('.slide');
  const slideHeight = slides[0].clientHeight;

  let currentIndex = 0;

  function moveSlide() {
    track.style.transform = `translateY(-${slideHeight * currentIndex}px)`;

    slides.forEach((slide, idx) => {
      const video = slide.querySelector('video');
      video.pause();
      video.currentTime = 0;
    });

    const currentSlide = slides[currentIndex];
    const currentVideo = currentSlide.querySelector('video');
    currentVideo.play();
  }

  // 클릭, 정지실행
  slides.forEach((slide, idx) => {
    const video = slide.querySelector('video');

    video.addEventListener('click', () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('ended', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      moveSlide();
    });
  });

  // 키보드(업다운 / 정지실행)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      currentIndex = (currentIndex + 1) % slides.length;
      moveSlide();
    } else if (event.key === 'ArrowUp') {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      moveSlide();
    } else if (event.code === 'Space') {
      event.preventDefault();
      const currentVideo = slides[currentIndex].querySelector('video');
      if (currentVideo.paused) {
        currentVideo.play();
      } else {
        currentVideo.pause();
      }
    }
  });

  // 영상 진행바
  function updateProgressBars() {
    slides.forEach((slide, idx) => {
      const video = slide.querySelector('video');
      const bar = slide.querySelector('.progress-bar');

      if (idx === currentIndex && video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        bar.style.width = `${percent}%`;
      } else {
        bar.style.width = `0%`;
      }
    });

    requestAnimationFrame(updateProgressBars);
  }

  // 초기 실행
  moveSlide();
  updateProgressBars();
});
