<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FUTURA | Steam Games Store</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Syne:wght@700;800&display=swap" rel="stylesheet">
    <style>
        /* --- CSS ПЕРЕМЕННЫЕ И СБРОС --- */
        :root {
            --bg-dark: #050505;
            --neon-lime: #d4ff00;
            --neon-purple: #a200ff;
            --text-white: #ffffff;
            --text-gray: #888888;
            --font-heading: 'Syne', sans-serif;
            --font-body: 'Inter', sans-serif;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background-color: var(--bg-dark);
            color: var(--text-white);
            font-family: var(--font-body);
            overflow-x: hidden;
            line-height: 1.5;
        }

        /* --- ТИПОГРАФИКА И УТИЛИТЫ --- */
        .container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        .neon-text { color: var(--neon-lime); }
        .purple-text { color: var(--neon-purple); }
        h1, h2, h3 { font-family: var(--font-heading); text-transform: uppercase; }
        
        /* --- АНИМАЦИИ --- */
        .reveal { opacity: 0; transform: translateY(50px); }

        /* --- НАВИГАЦИЯ --- */
        header {
            position: fixed; top: 0; width: 100%; padding: 20px 0;
            z-index: 100; backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-family: var(--font-heading); font-size: 24px; font-weight: 800; color: var(--text-white); }
        .logo span { color: var(--neon-lime); }
        .nav-links { display: flex; gap: 30px; list-style: none; }
        .nav-links a { color: var(--text-white); text-decoration: none; font-size: 14px; transition: color 0.3s; }
        .nav-links a:hover { color: var(--neon-lime); }
        .btn {
            background: var(--neon-lime); color: var(--bg-dark);
            padding: 12px 24px; border-radius: 30px; text-decoration: none;
            font-weight: 600; display: inline-flex; align-items: center; gap: 10px;
            transition: transform 0.3s, box-shadow 0.3s; border: none; cursor: pointer;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(212, 255, 0, 0.2); }

        /* --- HERO SECTION --- */
        .hero {
            min-height: 100vh; display: flex; align-items: center; padding-top: 100px;
            position: relative; overflow: hidden;
        }
        .hero-content { position: relative; z-index: 2; max-width: 800px; }
        .hero h1 { font-size: 6rem; line-height: 0.9; margin-bottom: 20px; letter-spacing: -2px; }
        .hero p { color: var(--text-gray); font-size: 1.2rem; max-width: 500px; margin-bottom: 40px; }
        
        /* 3D-подобный шар (имитация референса) */
        .blob {
            position: absolute; right: -10%; top: 20%; width: 600px; height: 600px;
            background: radial-gradient(circle at 30% 30%, var(--neon-purple), #2a004d, transparent 70%);
            border-radius: 50%; filter: blur(40px); opacity: 0.8; z-index: 1;
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-30px) scale(1.05); }
        }

        /* --- СЕКЦИЯ КАТАЛОГ --- */
        .catalog { padding: 100px 0; background: var(--neon-lime); color: var(--bg-dark); border-radius: 40px 40px 0 0; }
        .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 60px; }
        .section-header h2 { font-size: 4rem; line-height: 1; }
        
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
        .card {
            background: var(--bg-dark); border-radius: 20px; padding: 30px;
            color: var(--text-white); position: relative; overflow: hidden;
            transition: transform 0.4s; border: 1px solid rgba(255,255,255,0.1);
        }
        .card:hover { transform: translateY(-10px); }
        .card img { width: 100%; height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 20px; }
        .card h3 { font-size: 2rem; margin-bottom: 10px; }
        .card .price { font-size: 1.5rem; color: var(--neon-lime); font-weight: 800; margin-bottom: 20px; }
        .card .btn { width: 100%; justify-content: center; margin-top: 10px; }

        /* --- ФУТЕР --- */
        footer { padding: 50px 0; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; color: var(--text-gray); }

        /* --- АДАПТИВ --- */
        @media (max-width: 1024px) {
            .hero h1 { font-size: 4rem; }
            .grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
            .hero h1 { font-size: 3rem; }
            .grid { grid-template-columns: 1fr; }
            .nav-links { display: none; }
            .blob { width: 300px; height: 300px; right: -20%; top: 10%; }
        }
    </style>
</head>
<body>

    <!-- НАВИГАЦИЯ -->
    <header>
        <div class="container">
            <nav>
                <div class="logo">NEXUS<span>.</span></div>
                <ul class="nav-links">
                    <li><a href="#">Магазин</a></li>
                    <li><a href="#">Новинки</a></li>
                    <li><a href="#">Скидки</a></li>
                    <li><a href="#">Поддержка</a></li>
                </ul>
                <a href="#" class="btn">Войти <span>+</span></a>
            </nav>
        </div>
    </header>

    <!-- HERO SECTION -->
    <section class="hero">
        <div class="blob"></div>
        <div class="container hero-content">
            <h1 class="reveal">ИГРАЙ В<br><span class="neon-text">ЛУЧШЕЕ</span><br>ЗДЕСЬ</h1>
            <p class="reveal">Покупай ключи для Steam по лучшим ценам. Мгновенная доставка, поддержка 24/7 и огромный выбор игр.</p>
            <div class="reveal">
                <a href="#" class="btn">Купить игры <span>→</span></a>
            </div>
        </div>
    </section>

    <!-- КАТАЛОГ -->
    <section class="catalog">
        <div class="container">
            <div class="section-header reveal">
                <h2>ТОП<br>ПРОДАЖ</h2>
                <p style="max-width: 300px; font-weight: 600;">Самые ожидаемые и популярные игры этого месяца</p>
            </div>
            
            <div class="grid">
                <!-- Карточка 1 -->
                <div class="card reveal">
                    <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop" alt="Game">
                    <h3>Cyberpunk 2077</h3>
                    <div class="price">2 499 ₽</div>
                    <a href="#" class="btn">В корзину <span>→</span></a>
                </div>
                <!-- Карточка 2 -->
                <div class="card reveal" style="transition-delay: 0.1s;">
                    <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop" alt="Game">
                    <h3>Elden Ring</h3>
                    <div class="price">3 999 ₽</div>
                    <a href="#" class="btn">В корзину <span>→</span></a>
                </div>
                <!-- Карточка 3 -->
                <div class="card reveal" style="transition-delay: 0.2s;">
                    <img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop" alt="Game">
                    <h3>Baldur's Gate 3</h3>
                    <div class="price">1 999 ₽</div>
                    <a href="#" class="btn">В корзину <span>→</span></a>
                </div>
            </div>
        </div>
    </section>

    <!-- ФУТЕР -->
    <footer>
        <div class="container">
            <p>© 2024 NEXUS GAMES. Все права защищены.</p>
        </div>
    </footer>

    <!-- ПОДКЛЮЧЕНИЕ БИБЛИОТЕК (CDN) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://unpkg.com/@studio-freight/lenis@1.0.32/dist/lenis.min.js"></script>

    <script>
        // 1. Инициализация плавного скролла (Lenis)
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // 2. Анимации при скролле (GSAP)
        gsap.registerPlugin(ScrollTrigger);

        const reveals = document.querySelectorAll('.reveal');
        
        reveals.forEach((el) => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", // Начинать анимацию, когда элемент появился на 85% экрана
                    toggleActions: "play none none reverse"
                },
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out"
            });
        });

        // Небольшая анимация для кнопки в хедере при скролле
        const header = document.querySelector('header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.background = 'rgba(5, 5, 5, 0.9)';
            } else {
                header.style.background = 'transparent';
            }
        });
    </script>
</body>
</html>
