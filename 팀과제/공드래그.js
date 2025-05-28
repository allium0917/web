document.addEventListener("DOMContentLoaded", () => {
    const balls = document.querySelectorAll(".ball");
  
    balls.forEach(ball => {
      let offsetX = 0;
      let offsetY = 0;
      let isDragging = false;
  
      ball.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - ball.getBoundingClientRect().left;
        offsetY = e.clientY - ball.getBoundingClientRect().top;
        ball.style.position = "absolute";
        ball.style.zIndex = 1000;
        ball.style.display = "block"; // 드래그할 때 보여지도록
      });
  
      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        ball.style.left = `${e.clientX - offsetX}px`;
        ball.style.top = `${e.clientY - offsetY}px`;
      });
  
      document.addEventListener("mouseup", () => {
        isDragging = false;
      });
    });
  });
  