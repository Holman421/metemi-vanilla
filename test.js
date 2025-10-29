function animateMobileGrid() {
  if (!isBellow1024) return;
  const pinContainer = document.getElementById('grid-mobile-pin-container');
  const pinTarget = pinContainer.firstElementChild;
  const columnPercantagesOffset = 250;

  const buttons = Array.from(document.querySelectorAll('#grid-mobile-btn'));

  const firstColumnCards = [
    document.getElementById('grid-column-1-card-1'),
    document.getElementById('grid-column-1-card-2'),
    document.getElementById('grid-column-1-card-3'),
  ];

  const secondColumnCards = [
    document.getElementById('grid-column-2-card-1'),
    document.getElementById('grid-column-2-card-2'),
    document.getElementById('grid-column-2-card-3'),
  ];

  const thirdColumnCards = [
    document.getElementById('grid-column-3-card-1'),
    document.getElementById('grid-column-3-card-2'),
    document.getElementById('grid-column-3-card-3'),
    document.getElementById('grid-column-3-card-4'),
  ];

  const cardsArrays = [firstColumnCards, secondColumnCards, thirdColumnCards];

  cardsArrays.forEach((cards, colIdx) => {
    if (cards) {
      const px = colIdx * 16;
      cards.forEach((card, idx) => {
        if (card) {
          card.style.transform = `translateX(calc(${
            colIdx * columnPercantagesOffset
          }% + ${px}px))`;
        }
      });
    }
  });

  const getCurrentStateIndex = (progress) => {
    if (progress >= 0.75) return 2;
    if (progress >= 0.4) return 1;
    return 0;
  };

  const updateButtonStates = (activeIndex) => {
    buttons.forEach((btn, i) => {
      if (i === activeIndex) {
        btn.classList.add('bg-green');
      } else {
        btn.classList.remove('bg-green');
      }
    });
  };

  const animateCardsToState = (stateIndex) => {
    cardsArrays.forEach((cards, colIdx) => {
      if (cards) {
        const offset = colIdx - stateIndex;
        cards.forEach((card, cardIdx) => {
          if (card) {
            gsap.to(card, {
              transform: `translateX(calc(${
                offset * columnPercantagesOffset
              }% + 0px))`,
              duration: 0.5,
              ease: 'power2.inOut',
              delay: cardIdx * 0.075,
            });
          }
        });
      }
    });
  };

  let lastIdx = 0;
  ScrollTrigger.create({
    trigger: pinContainer,
    start: 'top top',
    end: 'bottom bottom',
    pin: pinTarget,
    scrub: 1,
    pinType: pinTarget.style.willChange === 'transform' ? 'transform' : 'fixed',
    onUpdate: (self) => {
      if (buttons.length !== 3) return;

      const currentStateIndex = getCurrentStateIndex(self.progress);

      if (currentStateIndex !== lastIdx) {
        updateButtonStates(currentStateIndex);
        animateCardsToState(currentStateIndex);
        lastIdx = currentStateIndex;
      }
    },
  });
}


      <div
            class="min-h-[300vh] w-full lg:hidden"
            id="grid-mobile-pin-container"
          >
            <div
              class="h-screen flex w-full flex-col items-center pt-[42px] pb-[20px] px-[48px]"
            >
              <div class="size-full relative">
                <!-- First column -->
                <div
                  id="mobile-grid-column-1"
                  class="flex flex-col gap-[12px] h-full absolute top-0 left-1/2 -translate-x-1/2 transition-[transform] duration-[300ms] w-full"
                >
                  <!-- Card 1 -->
                  <div
                    id="grid-column-1-card-1"
                    class="flex flex-col bg-green rounded-[16px] gap-[8px] py-[28px] px-[16px] md:p-[34px] flex-1 justify-center items-center"
                  >
                    <h4
                      class="text-black text-[32px]/[100%] font-bold text-center"
                    >
                      Get Paid Directly<span class="text-white">.</span>
                    </h4>
                    <p class="text-black text-[15px] text-center">
                      Direct payments, no subscriptions. Viewers pay as they go.
                      Zero fees.
                    </p>
                  </div>
                  <!-- Card 2 -->
                  <div
                    id="grid-column-1-card-2"
                    class="flex flex-col bg-black border-[2px] border-green rounded-[16px] gap-[8px] py-[28px] px-[16px] flex-1 md:p-[34px] justify-center items-center"
                  >
                    <h4
                      class="text-white text-[32px]/[100%] font-bold text-center"
                    >
                      Set Your Own Price<span class="text-green">.</span>
                    </h4>
                    <p class="text-green text-[16px] text-center">
                      You choose how much to charge. You earn 100%. Always.
                    </p>
                  </div>
                  <!-- Card 3 -->
                  <div
                    id="grid-column-1-card-3"
                    class="flex flex-col bg-black border-[2px] border-green rounded-[16px] gap-[8px] py-[28px] px-[16px] md:p-[34px] items-center"
                  >
                    <h4
                      class="text-white text-[32px]/[100%] font-bold text-center"
                    >
                      Earn via Tips<span class="text-green">.</span>
                    </h4>
                    <p class="text-green text-[16px] text-center">
                      Get tipped anytime. No pressure. Just appreciation turned
                      into cash.
                    </p>
                  </div>
                </div>

                <!-- Second column -->
                <div
                  id="mobile-grid-column-2"
                  class="flex flex-col gap-[12px] h-full absolute top-0 left-1/2 -translate-x-1/2 transition-[transform] duration-[300ms] w-full"
                >
                  <!-- Card 1 -->
                  <div
                    id="grid-column-2-card-1"
                    class="flex flex-col bg-black border-[2px] border-green rounded-[16px] gap-[8px] py-[20px] px-[16px] md:p-[34px] flex-1 justify-center items-center"
                  >
                    <h4
                      class="text-green text-[32px]/[100%] font-bold text-center"
                    >
                      Control Visibility<span class="text-white">.</span>
                    </h4>
                    <p class="text-green text-[16px] text-center">
                      Decide who sees what. Public, private, or invite-only.
                      Full content control.
                    </p>
                  </div>
                  <!-- Card 2 -->
                  <div
                    id="grid-column-2-card-2"
                    class="flex flex-col bg-green rounded-[16px] gap-[8px] py-[20px] px-[16px] md:p-[34px] flex-1 justify-center items-center"
                  >
                    <h4
                      class="text-black text-[32px]/[100%] font-bold text-center"
                    >
                      Share any type of Content<span class="text-white">.</span>
                    </h4>
                    <p class="text-black text-[15px] text-center">
                      Post tutorials, previews, shoutouts or anything that fits
                      your style.
                    </p>
                  </div>
                  <!-- Card 3 -->
                  <div
                    id="grid-column-2-card-3"
                    class="flex flex-col bg-black border-[2px] border-green rounded-[16px] gap-[8px] py-[20px] px-[16px] md:p-[34px] items-center"
                  >
                    <h4
                      class="text-green text-[32px]/[100%] font-bold text-center"
                    >
                      Secret Paid Content<span class="text-white">.</span>
                    </h4>
                    <p class="text-green text-[16px] text-center">
                      Sell exclusive videos directly through DMs. Personal.
                      Private. Premium.
                    </p>
                  </div>
                </div>

                <!-- Third column -->
                <div
                  id="mobile-grid-column-3"
                  class="flex flex-col gap-[12px] h-full absolute top-0 left-1/2 -translate-x-1/2 transition-[transform] duration-[300ms] w-full"
                >
                  <!-- Card 1 -->
                  <div
                    id="grid-column-3-card-1"
                    class="flex flex-col bg-black border-[2px] border-green rounded-[16px] gap-[8px] py-[12px] px-[16px] md:p-[34px] flex-1 justify-center items-center"
                  >
                    <h4
                      class="text-green text-[32px]/[100%] font-bold text-center"
                    >
                      Upload Your Way<span class="text-white">.</span>
                    </h4>
                    <p class="text-green text-[16px] text-center">
                      Let fans message you. You set the price and the rules.
                    </p>
                  </div>
                  <!-- Card 2 -->
                  <div
                    id="grid-column-3-card-2"
                    class="flex flex-col bg-black border-[2px] border-green rounded-[16px] gap-[8px] py-[12px] px-[16px] md:p-[34px] flex-1 justify-center items-center"
                  >
                    <h4
                      class="text-green text-[32px]/[100%] font-bold text-center"
                    >
                      Promote other channels<span class="text-white">.</span>
                    </h4>
                    <p class="text-green text-[16px] text-center">
                      Link to your socials, store or anything else with the
                      build-in bio link.
                    </p>
                  </div>
                  <!-- Card 3 -->
                  <div
                    id="grid-column-3-card-3"
                    class="flex flex-col bg-black border-[2px] border-green rounded-[16px] gap-[8px] py-[12px] px-[16px] md:p-[34px] flex-1 justify-center items-center"
                  >
                    <h4
                      class="text-green text-[32px]/[100%] font-bold text-center"
                    >
                      Earn via DM's<span class="text-white">.</span>
                    </h4>
                    <p class="text-green text-[16px] text-center">
                      Public, private, or direct-access only. Total control over
                      visibility.
                    </p>
                  </div>
                  <!-- Card 4 -->
                  <div
                    id="grid-column-3-card-4"
                    class="bg-green rounded-[20px] px-[8px] py-[12px] md:p-[36px] flex lg:items-start w-full flex-col h-fit items-center"
                  >
                    <div class="flex gap-[6px] items-center">
                      <h4 class="text-black text-[24px]/[100%] font-bold">
                        Live stream
                      </h4>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="66"
                        height="41"
                        viewBox="0 0 66 41"
                        fill="none"
                      >
                        <path
                          d="M31.1549 7.0111C41.0684 6.05791 48.7999 14.8946 46.0191 24.5909C42.8404 35.6694 27.9477 37.9641 21.4315 28.4675C15.6825 20.0897 20.9889 7.98874 31.1549 7.0111Z"
                          fill="black"
                        />
                        <path
                          d="M7.7905 0.623018C9.53667 0.320222 11.3467 1.49746 11.3548 3.37262C11.3602 4.55393 9.59098 6.9858 8.99625 8.21056C5.0925 16.2584 5.18891 25.5351 9.15919 33.5422C10.13 35.4988 12.4479 37.6876 10.6107 39.833C9.52717 41.0971 7.45784 41.1487 6.33355 39.8995C4.77613 38.1697 2.66063 33.1308 1.95184 30.8388C-0.886015 21.6598 0.302084 10.3994 5.73339 2.36647C6.26431 1.58029 6.74498 0.803609 7.7905 0.623018Z"
                          fill="black"
                        />
                        <path
                          d="M56.5391 0.623087C58.9602 0.211665 59.8129 2.11534 60.8068 3.89409C66.5979 14.257 66.6427 26.6947 60.9901 37.1188C60.4456 38.1236 59.4625 40.0666 58.4306 40.5337C56.622 41.3511 54.349 40.1657 54.2784 38.1222C54.2322 36.8038 55.7747 34.8593 56.3993 33.6142C60.6452 25.1563 60.4918 15.7995 56.2187 7.39593C55.647 6.27301 54.4467 4.79976 54.2987 3.60216C54.1385 2.30951 55.2628 0.838982 56.5391 0.623087Z"
                          fill="black"
                        />
                        <path
                          d="M14.7993 32.3154C12.9675 30.6209 11.3938 25.1189 11.2227 22.6531C10.9607 18.8661 11.8636 11.7891 14.7979 9.05583C16.1096 7.83379 17.9698 8.74761 17.7254 10.5576C17.6398 11.1863 16.8088 12.0376 16.4463 12.6717C13.8963 17.124 13.9044 23.9186 16.3105 28.428C16.9338 29.5957 18.6473 31.0744 17.2691 32.3684C16.5074 33.084 15.542 33.0038 14.7993 32.3154Z"
                          fill="black"
                        />
                        <path
                          d="M50.6876 8.91907C51.3624 9.49886 52.5614 11.8343 52.9307 12.7169C54.9987 17.6445 54.9756 24.2802 52.7515 29.1521C52.23 30.2953 50.879 32.9608 49.4546 32.8956C48.826 32.8671 47.995 32.2438 47.8918 31.6084C47.6718 30.2587 48.5598 29.7726 49.1763 28.6985C51.7467 24.2177 51.7168 17.487 49.3121 12.9423C48.7078 11.8017 47.145 10.4425 48.219 9.13903C48.8558 8.36779 49.9177 8.25509 50.6876 8.91771V8.91907Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                    <p class="text-black text-[16px]/[148%]">Comming soon..</p>
                  </div>
                </div>
              </div>
              <div class="flex gap-[8px] pt-[16px]">
                <div
                  id="grid-mobile-btn"
                  class="rounded-full size-[15px] border border-green bg-green transition-[colors] duration-[300ms]"
                ></div>
                <div
                  id="grid-mobile-btn"
                  class="rounded-full size-[15px] border border-green transition-[colors] duration-[300ms]"
                ></div>
                <div
                  id="grid-mobile-btn"
                  class="rounded-full size-[15px] border border-green transition-[colors] duration-[300ms]"
                ></div>
              </div>
            </div>
          </div>