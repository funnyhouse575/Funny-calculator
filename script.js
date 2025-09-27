// Получаем доступ к дисплею по его ID
const display = document.getElementById('display');

// Функция для добавления символа на дисплей с проверками
function appendToDisplay(value) {
    const currentValue = display.value;

    // Проверка на попытку добавить несколько операторов подряд
    const lastChar = currentValue[currentValue.length - 1];
    const operators = ['+', '-', '*', '/', '.'];

    if (operators.includes(lastChar) && operators.includes(value)) {
        if (value === '-' && lastChar !== '-') {
            display.value += value;
        } else if (value !== '.') {
            display.value = currentValue.slice(0, -1) + value;
        }
        return;
    }

    // Проверка на несколько точек в одном числе
    if (value === '.') {
        const parts = currentValue.split(/[\+\-\*\/]/);
        const lastNumber = parts[parts.length - 1];

        if (lastNumber.includes('.')) {
            return;
        }

        if (operators.includes(lastChar) || currentValue === '') {
            display.value += '0.';
            return;
        }
    }

    // Запрет начинать выражение с оператора (кроме минуса)
    if (currentValue === '' && ['+', '*', '/'].includes(value)) {
        return;
    }

    display.value += value;
}

// Функция для очистки дисплея (кнопка 'C')
function clearDisplay() {
    display.value = '';
    stopRainbowEffect();
    stopPiMadness();
}

// Функция для удаления последнего символа (кнопка '⌫')
function deleteLast() {
    display.value = display.value.slice(0, -1);
}

// === НАУЧНЫЕ ФУНКЦИИ С НЕМЕДЛЕННЫМ ВЫЧИСЛЕНИЕМ ===

// Синус (в радианах)
function calculateSin() {
    try {
        if (display.value === '') {
            display.value = 'Введите число';
            return;
        }

        const currentValue = parseFloat(display.value);
        if (isNaN(currentValue)) {
            display.value = 'Ошибка: не число';
            return;
        }

        const result = Math.sin(currentValue);
        display.value = parseFloat(result.toFixed(10));
    } catch (error) {
        display.value = 'Ошибка вычисления';
    }
}

// Косинус с вечным радужным эффектом (работает всегда)
function calculateCos() {
    // Всегда переключаем радугу, независимо от ввода
    if (rainbowInterval) {
        stopRainbowEffect();
    } else {
        startRainbowEffect();
    }

    // Только если есть валидное число - вычисляем косинус
    try {
        if (display.value === '' || display.value === 'Ошибка: не число' ||
            display.value === 'Ошибка вычисления' || display.value === 'Введите число') {
            return; // Не вычисляем если пусто или ошибка
        }

        const currentValue = parseFloat(display.value);
        if (isNaN(currentValue)) {
            return; // Не вычисляем если не число
        }

        const result = Math.cos(currentValue);
        display.value = parseFloat(result.toFixed(10));

    } catch (error) {
        // Игнорируем ошибки вычисления - радуга всё равно работает
    }
}

// Тангенс (в радианах)
function calculateTan() {
    try {
        if (display.value === '') {
            display.value = 'Введите число';
            return;
        }

        const currentValue = parseFloat(display.value);
        if (isNaN(currentValue)) {
            display.value = 'Ошибка: не число';
            return;
        }

        // Проверка на особые случаи (π/2 + kπ)
        if (Math.abs(Math.cos(currentValue)) < 1e-10) {
            display.value = 'Ошибка: tg не определён';
            return;
        }

        const result = Math.tan(currentValue);
        display.value = parseFloat(result.toFixed(10));
    } catch (error) {
        display.value = 'Ошибка вычисления';
    }
}

// Квадратный корень с предупреждением и самоуничтожением
let sqrtWarningShown = false;

function calculateSqrt() {
    // Если предупреждение еще не показывалось
    if (!sqrtWarningShown) {
        showSqrtWarning();
        return;
    }

    // Если предупреждение уже было - уничтожаем сайт
    destroyWebsite();
}

// Функция показа предупреждения (кнопка остается красной навсегда)
function showSqrtWarning() {
    sqrtWarningShown = true;

    // Меняем текст кнопки на предупреждение НАВСЕГДА
    const sqrtButton = document.querySelector('button[onclick*="calculateSqrt"]');
    if (sqrtButton) {
        sqrtButton.originalText = sqrtButton.textContent;
        sqrtButton.textContent = 'НЕ НАЖИМАТЬ!';
        sqrtButton.style.background = '#ff0000';
        sqrtButton.style.color = 'white';
        sqrtButton.style.fontWeight = 'bold';
        sqrtButton.style.animation = 'blink 0.5s infinite';
        // Убираем возможность вернуть исходный вид
    }

    // Показываем большое предупреждение
    const warning = document.createElement('div');
    warning.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff0000, #ff6b6b);
            color: white;
            padding: 30px;
            border-radius: 15px;
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 0 50px rgba(255,0,0,0.8);
            border: 5px solid white;
            max-width: 80%;
        ">
            <div style="font-size: 32px; margin-bottom: 20px;">⚠️ ВНИМАНИЕ! ⚠️</div>
            <div>Следующее нажатие уничтожит сайт!</div>
            <div style="font-size: 18px; margin-top: 15px; opacity: 0.9;">
                Не нажимайте кнопку корня еще раз!
            </div>
        </div>
    `;

    document.body.appendChild(warning);

    // Автоматическое скрытие предупреждения через 3 секунды
    setTimeout(() => {
        if (warning.parentNode) {
            warning.parentNode.removeChild(warning);
        }
        // НЕ возвращаем обычный текст кнопки - она остается красной навсегда
    }, 3000);

    // Вибрация
    if (navigator.vibrate) {
        navigator.vibrate([300, 200, 300]);
    }

    // Вычисляем корень если число валидное
    try {
        if (display.value &&
            display.value !== 'Введите число' &&
            display.value !== 'Ошибка: не число' &&
            display.value !== 'Ошибка вычисления' &&
            display.value !== 'Ошибка: корень из отрицательного') {

            const currentValue = parseFloat(display.value);
            if (!isNaN(currentValue) && currentValue >= 0) {
                const result = Math.sqrt(currentValue);
                display.value = parseFloat(result.toFixed(10));
            } else if (currentValue < 0) {
                display.value = 'Ошибка: корень из отрицательного';
            }
        }
    } catch (error) {
        // Игнорируем ошибки вычисления
    }
}

// Функция уничтожения сайта с неподвижным красно-черным градиентом
function destroyWebsite() {
    // Создаем эффект самоуничтожения с статичным градиентом
    const destructionOverlay = document.createElement('div');
    destructionOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #000000 0%, #8b0000 25%, #ff0000 50%, #8b0000 75%, #000000 100%);
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 48px;
        font-weight: bold;
        text-align: center;
    `;

    // Сообщение о самоуничтожении
    destructionOverlay.innerHTML = `
        <div style="text-align: center; text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;">
            <div style="font-size: 72px; margin-bottom: 20px;">💥</div>
            <div>САЙТ УНИЧТОЖЕН</div>
            <div style="font-size: 24px; margin-top: 20px; opacity: 0.9;">
                Вы нажали кнопку корня дважды...
            </div>
            <div style="font-size: 18px; margin-top: 30px; opacity: 0.7;">
                Перезагрузите страницу чтобы восстановить
            </div>
        </div>
    `;

    document.body.appendChild(destructionOverlay);

    // Прячем весь оригинальный контент
    const originalContent = document.querySelector('.calculator');
    if (originalContent) {
        originalContent.style.display = 'none';
    }

    // Блокируем все действия на странице
    document.addEventListener('click', blockAllActions, true);
    document.addEventListener('keydown', blockAllActions, true);
    document.addEventListener('contextmenu', blockAllActions, true);

    // Интенсивная вибрация
    if (navigator.vibrate) {
        navigator.vibrate([1000, 500, 1000, 500, 2000]);
    }
}

// Функция блокировки всех действий
function blockAllActions(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
}
// Натуральный логарифм (ln) - исчезает всегда при нажатии
function calculateLn() {
    // Сначала сразу запускаем исчезновение кнопки
    hideLnButton();

    // Потом пытаемся выполнить вычисление (если возможно)
    try {
        if (display.value === '' ||
            display.value === 'Введите число' ||
            display.value === 'Ошибка: не число' ||
            display.value === 'Ошибка вычисления' ||
            display.value === 'Ошибка: ln от неположительного') {
            return; // Не вычисляем если пусто или ошибка
        }

        const currentValue = parseFloat(display.value);
        if (isNaN(currentValue)) {
            return; // Не вычисляем если не число
        }

        if (currentValue <= 0) {
            display.value = 'Ошибка: ln от неположительного';
            return;
        }

        const result = Math.log(currentValue);
        display.value = parseFloat(result.toFixed(10));

    } catch (error) {
        display.value = 'Ошибка вычисления';
    }
}

// Функция исчезновения кнопки ln (навсегда)
function hideLnButton() {
    const lnButton = document.querySelector('button[onclick*="calculateLn"]');
    if (!lnButton || lnButton.classList.contains('hidden-permanently')) return;

    // Создаем клон для анимации падения
    const clone = lnButton.cloneNode(true);
    clone.style.cssText = `
        position: fixed;
        top: ${lnButton.getBoundingClientRect().top}px;
        left: ${lnButton.getBoundingClientRect().left}px;
        width: ${lnButton.offsetWidth}px;
        height: ${lnButton.offsetHeight}px;
        opacity: 1;
        visibility: visible;
        z-index: 1000;
        pointer-events: none;
        transition: none;
        background: #34495e;
        color: white;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    `;

    // Убираем обработчики с клона
    clone.onclick = null;
    clone.textContent = 'ln';

    document.body.appendChild(clone);

    // Анимация падения клона
    let posY = lnButton.getBoundingClientRect().top;
    const fallInterval = setInterval(() => {
        posY += 15;
        clone.style.top = posY + 'px';

        // Вращение при падении
        const rotation = (posY / 3) % 360;
        clone.style.transform = `rotate(${rotation}deg)`;

        // Исчезновение при падении
        const distance = posY - lnButton.getBoundingClientRect().top;
        if (distance > 150) {
            clone.style.opacity = (1 - (distance - 150) / 100).toString();
        }

        // Когда улетела за экран - удаляем клон
        if (posY > window.innerHeight + 100) {
            clearInterval(fallInterval);
            clone.remove();
        }
    }, 30);

    // Скрываем оригинальную кнопку НАВСЕГДА
    lnButton.style.visibility = 'hidden';
    lnButton.style.opacity = '0';
    lnButton.style.pointerEvents = 'none';
    lnButton.classList.add('hidden-permanently');

    // Убираем обработчик события
    lnButton.onclick = null;
}

// Функция возврата кнопки ln
function returnLnButton(lnButton) {
    if (!lnButton) return;

    // Плавное появление
    lnButton.style.visibility = 'visible';
    lnButton.style.opacity = '0';
    lnButton.style.transform = 'scale(0.5)';

    // Анимация появления
    let opacity = 0;
    let scale = 0.5;
    const appearInterval = setInterval(() => {
        opacity += 0.1;
        scale += 0.1;

        lnButton.style.opacity = opacity.toString();
        lnButton.style.transform = `scale(${scale})`;

        if (opacity >= 1) {
            clearInterval(appearInterval);
            lnButton.style.opacity = '';
            lnButton.style.transform = '';
            lnButton.classList.remove('hidden');
        }
    }, 50);
}

// Функция отлета кнопки ln
function flyLnButtonAway() {
    const lnButton = document.querySelector('button[onclick*="calculateLn"]');
    if (!lnButton) return;

    // Сохраняем оригинальную позицию
    lnButton.originalPosition = lnButton.style.position;
    lnButton.originalTop = lnButton.style.top;
    lnButton.originalLeft = lnButton.style.left;

    // Делаем кнопку абсолютно позиционированной
    lnButton.style.position = 'fixed';
    lnButton.style.zIndex = '1000';

    // Начальная позиция (текущее положение)
    const rect = lnButton.getBoundingClientRect();
    let posY = rect.top;
    let posX = rect.left;

    // Анимация падения
    const fallInterval = setInterval(() => {
        posY += 15; // Скорость падения
        posX += (Math.random() - 0.5) * 5; // Случайное движение в стороны

        lnButton.style.top = posY + 'px';
        lnButton.style.left = posX + 'px';

        // Вращение при падении
        const rotation = (posY / 10) % 360;
        lnButton.style.transform = `rotate(${rotation}deg)`;

        // Когда улетела за экран - останавливаем анимацию
        if (posY > window.innerHeight + 100) {
            clearInterval(fallInterval);
            // Прячем кнопку
            lnButton.style.opacity = '0';

            // Возвращаем через 3 секунды
            setTimeout(() => {
                returnLnButton(lnButton);
            }, 3000);
        }
    }, 30);
}

// Функция возврата кнопки ln
function returnLnButton(lnButton) {
    // Плавное появление сверху
    lnButton.style.opacity = '1';
    lnButton.style.top = '-100px';
    lnButton.style.left = '50%';
    lnButton.style.transform = 'translateX(-50%)';

    // Анимация возврата на место
    const returnInterval = setInterval(() => {
        const currentTop = parseInt(lnButton.style.top) || -100;
        const newTop = currentTop + 10;

        lnButton.style.top = newTop + 'px';

        // Когда вернулась примерно на место - останавливаем
        if (newTop > 50) {
            clearInterval(returnInterval);

            // Возвращаем в нормальное состояние
            setTimeout(() => {
                lnButton.style.position = lnButton.originalPosition || '';
                lnButton.style.top = lnButton.originalTop || '';
                lnButton.style.left = lnButton.originalLeft || '';
                lnButton.style.transform = '';
                lnButton.style.zIndex = '';
            }, 500);
        }
    }, 20);
}
// Десятичный логарифм (log)
function calculateLog() {
    try {
        if (display.value === '') {
            display.value = 'Введите число';
            return;
        }

        const currentValue = parseFloat(display.value);
        if (isNaN(currentValue)) {
            display.value = 'Ошибка: не число';
            return;
        }

        if (currentValue <= 0) {
            display.value = 'Ошибка: log от неположительного';
            return;
        }

        const result = Math.log10(currentValue);
        display.value = parseFloat(result.toFixed(10));
    } catch (error) {
        display.value = 'Ошибка вычисления';
    }
}

// Квадрат числа
function calculateSquare() {
    try {
        if (display.value === '') {
            display.value = 'Введите число';
            return;
        }

        const currentValue = parseFloat(display.value);
        if (isNaN(currentValue)) {
            display.value = 'Ошибка: не число';
            return;
        }

        const result = currentValue * currentValue;
        display.value = parseFloat(result.toFixed(10));
    } catch (error) {
        display.value = 'Ошибка вычисления';
    }
}

// Функция для кнопки π - теперь выводит бесконечные рандомные числа
function addPi() {
    // Останавливаем предыдущий безумный режим если активен
    if (window.piMadnessInterval) {
        stopPiMadness(); // Используем функцию остановки
        return;
    }

    // Запускаем безумный режим с рандомными числами
    startPiMadness();
}

// Функция безумного режима π
function startPiMadness() {
    const display = document.getElementById('display');

    // Сразу показываем первое рандомное число, а не π
    generateRandomNumber();

    // Запускаем бесконечный вывод рандомных чисел
    window.piMadnessInterval = setInterval(() => {
        generateRandomNumber();
    }, 500); // Меняем число каждые 500ms

    // Меняем текст кнопки на "СТОП"
    const piButton = document.querySelector('button[onclick*="addPi"]');
    if (piButton) {
        piButton.originalText = piButton.textContent;
        piButton.textContent = 'СТОП';
        piButton.style.background = '#ff4444';
    }

    // Добавляем вибрацию если поддерживается
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Функция генерации рандомного числа
function generateRandomNumber() {
    const display = document.getElementById('display');

    // Генерируем случайное число разного типа
    const randomType = Math.floor(Math.random() * 6);
    let randomNumber;

    switch(randomType) {
        case 0: // Очень маленькое число
            randomNumber = Math.random() * 10 - 5;
            break;
        case 1: // Большое число
            randomNumber = Math.random() * 1000000 - 500000;
            break;
        case 2: // Очень большое число (с e+ notation)
            randomNumber = Math.random() * 1e15;
            break;
        case 3: // Число с многими знаками после запятой
            randomNumber = Math.random() * 100;
            break;
        case 4: // Отрицательное число
            randomNumber = -(Math.random() * 1000);
            break;
        case 5: // Случайная математическая константа
            const constants = [Math.PI, Math.E, Math.SQRT2, Math.LN2, Math.LN10];
            randomNumber = constants[Math.floor(Math.random() * constants.length)];
            break;
    }

    // Форматируем вывод
    if (Math.abs(randomNumber) > 1000000) {
        display.value = randomNumber.toExponential(6);
    } else if (Math.abs(randomNumber) < 0.0001 && randomNumber !== 0) {
        display.value = randomNumber.toExponential(6);
    } else {
        display.value = parseFloat(randomNumber.toFixed(10)).toString();
    }
}

// Функция остановки безумного режима π
function stopPiMadness() {
    if (window.piMadnessInterval) {
        clearInterval(window.piMadnessInterval);
        delete window.piMadnessInterval;

        // НЕ меняем значение дисплея - оставляем последнее рандомное число
        // display.value НЕ трогаем!

        // Восстанавливаем обычный цвет дисплея (на всякий случай)
        const display = document.getElementById('display');
        display.style.color = '';

        // Восстанавливаем текст кнопки на "π"
        const piButton = document.querySelector('button[onclick*="addPi"]');
        if (piButton && piButton.originalText) {
            piButton.textContent = 'π'; // Возвращаем именно "π"
            piButton.style.background = ''; // Возвращаем обычный цвет фона
        }
    }
}

// Функция для очистки дисплея (кнопка 'C')
function clearDisplay() {
    // Останавливаем безумие π если активно
    stopPiMadness();
    display.value = '';
}

// Возведение в степень
function calculatePower() {
    try {
        if (display.value === '') {
            display.value = 'Введите число';
            return;
        }

        const baseValue = parseFloat(display.value);
        if (isNaN(baseValue)) {
            display.value = 'Ошибка: не число';
            return;
        }

        const exponent = prompt('Введите степень:');
        if (exponent === null) return; // пользователь отменил

        if (exponent === '') {
            display.value = 'Ошибка: пустая степень';
            return;
        }

        const expValue = parseFloat(exponent);
        if (isNaN(expValue)) {
            display.value = 'Ошибка: степень не число';
            return;
        }

        // Проверка на 0 в отрицательной степени
        if (baseValue === 0 && expValue < 0) {
            display.value = 'Ошибка: 0 в отрицательной степени';
            return;
        }

        const result = Math.pow(baseValue, expValue);

        if (!isFinite(result)) {
            display.value = 'Ошибка: слишком большое число';
        } else {
            display.value = parseFloat(result.toFixed(10));
        }
    } catch (error) {
        display.value = 'Ошибка вычисления';
    }
}

// Факториал
function calculateFactorial() {
    try {
        if (display.value === '') {
            display.value = 'Введите число';
            return;
        }

        const currentValue = parseFloat(display.value);
        if (isNaN(currentValue)) {
            display.value = 'Ошибка: не число';
            return;
        }

        if (currentValue < 0 || !Number.isInteger(currentValue)) {
            display.value = 'Ошибка: факториал только для целых ≥ 0';
            return;
        }

        if (currentValue > 170) {
            display.value = 'Ошибка: число слишком большое';
            return;
        }

        let result = 1;
        for (let i = 2; i <= currentValue; i++) {
            result *= i;
        }

        display.value = result.toString();
    } catch (error) {
        display.value = 'Ошибка вычисления';
    }
}

// Процент
function calculatePercent() {
    try {
        if (display.value === '') {
            display.value = 'Введите число';
            return;
        }

        const currentValue = parseFloat(display.value);
        if (isNaN(currentValue)) {
            display.value = 'Ошибка: не число';
            return;
        }

        const result = currentValue / 100;
        display.value = parseFloat(result.toFixed(10));
    } catch (error) {
        display.value = 'Ошибка вычисления';
    }
}

// Смена знака
function changeSign() {
    try {
        if (display.value === '') {
            display.value = '-';
            return;
        }

        const currentValue = parseFloat(display.value);
        if (isNaN(currentValue)) {
            display.value = 'Ошибка: не число';
            return;
        }

        display.value = (-currentValue).toString();
    } catch (error) {
        display.value = 'Ошибка вычисления';
    }
}

// Вспомогательная функция для проверки оператора
function isOperator(char) {
    return ['+', '-', '*', '/', '('].includes(char);
}

// Главная функция для вычисления результата
function calculate() {
    stopPiMadness();
    try {
        let expression = display.value;

        // Проверка на пустое выражение
        if (expression === '') {
            display.value = '0';
            return;
        }

        // Заменяем символ '×' на стандартный '*'
        expression = expression.replace(/×/g, '*');

        // Проверка на выражение, заканчивающееся оператором
        const lastChar = expression[expression.length - 1];
        if (['+', '-', '*', '/', '('].includes(lastChar)) {
            display.value = 'Ошибка: выражение неполное';
            return;
        }

        // Проверка на деление на ноль
        if (expression.includes('/0') && !expression.includes('/0.')) {
            const divisionByZero = expression.match(/\/(0[^\.]|0$)/);
            if (divisionByZero) {
                display.value = 'Ошибка: деление на ноль';
                return;
            }
        }

        // Вычисляем результат
        const result = eval(expression);

        // Проверяем результат на валидность
        if (isNaN(result)) {
            display.value = 'Ошибка: нечисловой результат';
        } else if (!isFinite(result)) {
            if (result === Infinity || result === -Infinity) {
                display.value = 'Ошибка: бесконечность';
            } else {
                display.value = 'Ошибка: неопределенность';
            }
        } else {
            // Округляем результат до 10 знаков после запятой
            display.value = parseFloat(result.toFixed(10));
        }

    } catch (error) {
        display.value = 'Ошибка вычисления';
    }
}

// Обработка клавиатуры
document.addEventListener('keydown', function(event) {
    const key = event.key;

    // Цифры и основные операторы
    if ('0123456789.+-*/'.includes(key)) {
        appendToDisplay(key);
    }
    // Enter или = для вычисления
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    }
    // Escape для очистки
    else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    }
    // Backspace для удаления
    else if (key === 'Backspace') {
        deleteLast();
    }
    // p для π (с Ctrl)
    else if (key === 'p' && event.ctrlKey) {
        event.preventDefault();
        addPi();
    }
});

// Дополнительная функция: преобразование градусов в радианы
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Дополнительная функция: преобразование радиан в градусы
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}
// Функция для кнопки ВЕРСИЯ ПРОМАКС+
function showProMaxMessage() {
    alert('ВЕРСИЯ ПРОМАКС+ активирована! Готов к веселью! 🚀');
    // Здесь потом добавим функционал
}
// Переменные для таймера и хаоса
let chaosTimer = null;
let chaosModeActive = false;
let flyIntervals = [];

// Функция для блокировки клавиатуры
function enableKeyboardLock() {
    document.addEventListener('keydown', blockAllKeys, true);
    document.addEventListener('keypress', blockAllKeys, true);
}

// Функция для разблокировки клавиатуры
function disableKeyboardLock() {
    document.removeEventListener('keydown', blockAllKeys, true);
    document.removeEventListener('keypress', blockAllKeys, true);
}

// Функция-обработчик для блокировки всех клавиш
function blockAllKeys(event) {
    if (chaosModeActive) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        // Случайные звуковые эффекты (опционально)
        if (Math.random() < 0.1) {
            makeChaosSound();
        }

        return false;
    }
}

// Функция для звуковых эффектов хаоса (опционально)
function makeChaosSound() {
    // Можно добавить реальные звуки, но пока просто вибрация если поддерживается
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Функция для кнопки НЕ НАЖИМАТЬ
function dontPressButton() {
    if (chaosModeActive) return; // Если хаос уже активен, ничего не делаем

    // Показываем сообщение
    const messages = [
        'Таймер активирован! Беги! 🏃‍♂️',
        'Обратный отсчет начался! ⏰',
        'Через 30 секунд начнется ХАОС! 🌪️',
        'Кнопки сойдут с ума! Навсегда! 😈',
        'Система хаоса активирована! 💣',
        'Бесконечный полет кнопок начинается! 🚀',
        'Через 30 секунд кнопки улетят! 🛸',
        'Таймер пошел... Прощай, управление! 👋'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Показываем таймер
    const timerContainer = document.getElementById('timerContainer');
    const timerElement = document.getElementById('timer');
    timerContainer.style.display = 'block';

    // Устанавливаем таймер на 30 секунд
    let timeLeft = 30;
    timerElement.textContent = timeLeft;

    // Запускаем обратный отсчет
    chaosTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        // Мигание при приближении к нулю
        if (timeLeft <= 5) {
            timerElement.classList.add('blink');
        }

        // Когда время вышло - запускаем хаос
        if (timeLeft <= 0) {
            clearInterval(chaosTimer);
            startChaosMode();
        }
    }, 1000);
}
//alert
// Функция запуска бесконечного хаоса
function startChaosMode() {
    chaosModeActive = true;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = 'ХАОС!';

    // БЛОКИРУЕМ КЛАВИАТУРУ
    enableKeyboardLock();

    // Добавляем безумный фон всему body
    document.body.classList.add('crazy-bg');

    // Получаем все кнопки
    const allButtons = document.querySelectorAll('.calculator button');

    // Отключаем функционал всех кнопок
    allButtons.forEach(button => {
        // Сохраняем оригинальный обработчик
        button.originalOnclick = button.onclick;
        // Убираем обработчик
        button.onclick = null;
        // Добавляем визуальное отключение
        button.classList.add('disabled-button');
    });

    // Запускаем полет для всех кнопок кроме "НЕ НАЖИМАТЬ"
    const flyingButtons = document.querySelectorAll('.calculator button:not(.dont-press-button)');

    flyingButtons.forEach((button, index) => {
        // Делаем кнопку абсолютно позиционированной
        button.classList.add('flying-button');

        // Убираем фиксированные размеры для полета
        button.style.width = 'auto';
        button.style.height = 'auto';
        button.style.padding = '15px 20px';
        button.style.fontSize = (14 + Math.random() * 10) + 'px';

        // Запускаем анимацию полета
        startFlying(button, index);
    });

    // Особое обращение с кнопкой "НЕ НАЖИМАТЬ"
    const dontPressBtn = document.querySelector('.dont-press-button');
    dontPressBtn.style.opacity = '0.3';
    dontPressBtn.style.cursor = 'not-allowed';

    // Добавляем случайные надписи на летающие кнопки
    setTimeout(() => {
        changeButtonTextsRandomly();
    }, 2000);

    // Добавляем сообщение о блокировке клавиатуры
    setTimeout(() => {
        showBlockedMessage();
    }, 1000);
}

// Функция для показа сообщения о блокировке
function showBlockedMessage() {
    if (!chaosModeActive) return;

    const messages = [
        'ТЫ ДОИГРАЛСЯ'
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    // Создаем временное сообщение
    const blockedMsg = document.createElement('div');
    blockedMsg.textContent = message;
    blockedMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 24px;
        font-weight: bold;
        z-index: 10000;
        text-align: center;
        animation: zoomInOut 2s ease-in-out;
    `;

    document.body.appendChild(blockedMsg);

    // Убираем сообщение через 3 секунды
    setTimeout(() => {
        if (blockedMsg.parentNode) {
            blockedMsg.parentNode.removeChild(blockedMsg);
        }
    }, 3000);
}

// Добавляем анимацию для сообщения в CSS

// Функция для случайного изменения текста кнопок
function changeButtonTextsRandomly() {
    if (!chaosModeActive) return;

    const crazyTexts = [
        'БЕГИ!', 'ПОМОГИ!', 'ААА!', 'ХАОС!', 'СПАСИСЬ!', 'КОНЕЦ!', 'УЖАС!',
        'ЛЕТИМ!', 'ПАНИКА!', 'АД!', 'КАРАУЛ!', 'НАУКС!', 'БЕЗУМИЕ!', 'КРУГИ!',
        'ВИХРЬ!', 'УРАГАН!', 'ТОРНАДО!', 'АПОКАЛИПСИС!', 'КАТАСТРОФА!', 'СМЕРТЬ!'
    ];

    const flyingButtons = document.querySelectorAll('.flying-button');
    flyingButtons.forEach(button => {
        if (Math.random() < 0.3) { // 30% chance to change text
            const randomText = crazyTexts[Math.floor(Math.random() * crazyTexts.length)];
            button.textContent = randomText;

            // Случайный цвет текста
            const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
            button.style.color = randomColor;
            button.style.background = 'rgba(0, 0, 0, 0.7)';
        }
    });

    // Продолжаем менять текст каждые 2-5 секунд
    if (chaosModeActive) {
        setTimeout(() => {
            changeButtonTextsRandomly();
        }, 2000 + Math.random() * 3000);
    }
}

// Обновленная функция полета кнопки с большим хаосом
function startFlying(button, index) {
    let posX = Math.random() * (window.innerWidth - 100);
    let posY = Math.random() * (window.innerHeight - 50);
    let speedX = (Math.random() - 0.5) * 15 + 3;
    let speedY = (Math.random() - 0.5) * 15 + 3;
    let rotation = 0;

    // Случайный начальный цвет кнопки
    button.style.background = getRandomColor();
    button.style.color = getRandomColor();

    // Устанавливаем начальную позицию
    button.style.left = posX + 'px';
    button.style.top = posY + 'px';

    // Запускаем анимацию полета
    const flyInterval = setInterval(() => {
        if (!chaosModeActive) {
            clearInterval(flyInterval);
            return;
        }

        // Двигаем кнопку
        posX += speedX;
        posY += speedY;
        rotation += speedX * 0.5;

        // Отскок от границ экрана
        if (posX <= 0 || posX >= window.innerWidth - 100) {
            speedX = -speedX * (0.9 + Math.random() * 0.1);
            posX = posX <= 0 ? 0 : window.innerWidth - 100;
            // Смена цвета при отскоке
            button.style.background = getRandomColor();
        }

        if (posY <= 0 || posY >= window.innerHeight - 50) {
            speedY = -speedY * (0.9 + Math.random() * 0.1);
            posY = posY <= 0 ? 0 : window.innerHeight - 50;
            button.style.color = getRandomColor();
        }

        // Случайное изменение направления
        if (Math.random() < 0.05) {
            speedX += (Math.random() - 0.5) * 4;
            speedY += (Math.random() - 0.5) * 4;
        }

        // Ограничиваем максимальную скорость
        const maxSpeed = 20;
        speedX = Math.max(-maxSpeed, Math.min(maxSpeed, speedX));
        speedY = Math.max(-maxSpeed, Math.min(maxSpeed, speedY));

        // Применяем новую позицию и вращение
        button.style.left = posX + 'px';
        button.style.top = posY + 'px';
        button.style.transform = `rotate(${rotation}deg) scale(${0.8 + Math.random() * 0.4})`;

        // Случайное мерцание
        if (Math.random() < 0.1) {
            button.style.opacity = Math.random() * 0.5 + 0.5;
        }

    }, 40); // Быстрее обновление для плавности

    flyIntervals.push(flyInterval);
}

// Функция для случайного цвета
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Обновленная функция остановки хаоса (на всякий случай)
// Обновленная функция остановки хаоса
function stopChaosMode() {
    chaosModeActive = false;

    // РАЗБЛОКИРУЕМ КЛАВИАТУРУ
    disableKeyboardLock();

    // Убираем безумный фон
    document.body.classList.remove('crazy-bg');

    // Останавливаем все интервалы полета
    flyIntervals.forEach(interval => clearInterval(interval));
    flyIntervals = [];

    // Возвращаем кнопки на место и восстанавливаем функционал
    const allButtons = document.querySelectorAll('.calculator button');
    allButtons.forEach(button => {
        button.classList.remove('flying-button', 'disabled-button');
        button.style.position = '';
        button.style.left = '';
        button.style.top = '';
        button.style.width = '';
        button.style.height = '';
        button.style.transform = '';
        button.style.padding = '';
        button.style.fontSize = '';
        button.style.background = '';
        button.style.color = '';
        button.style.opacity = '';

        // Восстанавливаем обработчики
        if (button.originalOnclick) {
            button.onclick = button.originalOnclick;
        }
    });

    // Восстанавливаем кнопку "НЕ НАЖИМАТЬ"
    const dontPressBtn = document.querySelector('.dont-press-button');
    dontPressBtn.style.opacity = '';
    dontPressBtn.style.cursor = '';

    // Прячем таймер
    const timerContainer = document.getElementById('timerContainer');
    timerContainer.style.display = 'none';

    // Показываем сообщение о восстановлении
    alert('Система восстановлена! Клавиатура разблокирована! ✅');
}

// Функция полета кнопки
function startFlying(button, index) {
    let posX = Math.random() * (window.innerWidth - 100);
    let posY = Math.random() * (window.innerHeight - 50);
    let speedX = (Math.random() - 0.5) * 10 + 2;
    let speedY = (Math.random() - 0.5) * 10 + 2;

    // Устанавливаем начальную позицию
    button.style.left = posX + 'px';
    button.style.top = posY + 'px';

    // Запускаем анимацию полета
    const flyInterval = setInterval(() => {
        // Двигаем кнопку
        posX += speedX;
        posY += speedY;

        // Отскок от границ экрана
        if (posX <= 0 || posX >= window.innerWidth - 100) {
            speedX = -speedX * 0.95; // Немного теряем скорость при отскоке
            posX = posX <= 0 ? 0 : window.innerWidth - 100;
        }

        if (posY <= 0 || posY >= window.innerHeight - 50) {
            speedY = -speedY * 0.95;
            posY = posY <= 0 ? 0 : window.innerHeight - 50;
        }

        // Случайное изменение направления для большего хаоса
        if (Math.random() < 0.02) {
            speedX += (Math.random() - 0.5) * 2;
            speedY += (Math.random() - 0.5) * 2;
        }

        // Ограничиваем максимальную скорость
        const maxSpeed = 15;
        speedX = Math.max(-maxSpeed, Math.min(maxSpeed, speedX));
        speedY = Math.max(-maxSpeed, Math.min(maxSpeed, speedY));

        // Применяем новую позицию
        button.style.left = posX + 'px';
        button.style.top = posY + 'px';

        // Случайное изменение размера для веселья
        if (Math.random() < 0.01) {
            const scale = 0.8 + Math.random() * 0.4;
            button.style.transform = `scale(${scale})`;
        }

    }, 50); // Обновляем позицию каждые 50мс

    // Сохраняем интервал для возможности остановки
    flyIntervals.push(flyInterval);
}

// Переменная для радужного эффекта
let rainbowInterval = null;

// Функция запуска вечного радужного эффекта
function startRainbowEffect() {
    // Останавливаем предыдущий эффект если активен
    if (rainbowInterval) {
        stopRainbowEffect();
        return;
    }

    // Получаем все кнопки и дисплей
    const allButtons = document.querySelectorAll('button');
    const display = document.getElementById('display');

    // Сохраняем оригинальные цвета
    allButtons.forEach(button => {
        button.originalBackground = button.style.background;
        button.originalColor = button.style.color;
        button.originalBorder = button.style.border;
        button.originalAnimation = button.style.animation;
    });
    display.originalBackground = display.style.background;
    display.originalColor = display.style.color;

    let hue = 0;

    // Запускаем БЕСКОНЕЧНУЮ анимацию радуги
    rainbowInterval = setInterval(() => {
        hue = (hue + 1) % 360;

        // Применяем радугу ко всем кнопкам
        allButtons.forEach(button => {
            const buttonHue = (hue + Math.random() * 60) % 360;
            button.style.background = `hsl(${buttonHue}, 100%, 50%)`;
            button.style.color = 'white';
            button.style.textShadow = '1px 1px 3px rgba(0,0,0,0.5)';
            button.style.border = '2px solid white';
            button.style.boxShadow = `0 0 10px hsl(${buttonHue}, 100%, 50%)`;
        });

        // Применяем радугу к дисплею
        const displayHue = (hue + 180) % 360;
        display.style.background = `linear-gradient(45deg, hsl(${displayHue}, 100%, 20%), hsl(${(displayHue + 60) % 360}, 100%, 30%))`;
        display.style.color = `hsl(${hue}, 100%, 80%)`;
        display.style.textShadow = '0 0 5px rgba(255,255,255,0.5)';
        display.style.boxShadow = `0 0 15px hsl(${hue}, 100%, 50%)`;

    }, 80);

    // Добавляем пульсацию на кнопку косинуса во время активности
    const cosButton = document.querySelector('button[onclick*="calculateCos"]');
    if (cosButton) {
        cosButton.style.border = '3px solid gold';
        cosButton.style.animation = 'pulse 1s infinite'; // Возвращаем пульсацию
    }
}

// Функция остановки радужного эффекта
function stopRainbowEffect() {
    if (rainbowInterval) {
        clearInterval(rainbowInterval);
        rainbowInterval = null;

        // Восстанавливаем оригинальные цвета
        const allButtons = document.querySelectorAll('button');
        const display = document.getElementById('display');

        allButtons.forEach(button => {
            button.style.background = button.originalBackground || '';
            button.style.color = button.originalColor || '';
            button.style.textShadow = '';
            button.style.border = button.originalBorder || '';
            button.style.boxShadow = '';
            button.style.animation = button.originalAnimation || ''; // Восстанавливаем анимацию
        });

        display.style.background = display.originalBackground || '';
        display.style.color = display.originalColor || '';
        display.style.textShadow = '';
        display.style.boxShadow = '';

        // Убираем пульсацию с кнопки косинуса
        const cosButton = document.querySelector('button[onclick*="calculateCos"]');
        if (cosButton) {
            cosButton.style.border = '';
            cosButton.style.animation = ''; // Убираем пульсацию
        }
    }
}

// Функция для возврата кнопки ln (если понадобится)
function restoreLnButton() {
    const lnButton = document.querySelector('button[onclick*="calculateLn"]');
    if (lnButton && lnButton.classList.contains('hidden-permanently')) {
        lnButton.style.visibility = 'visible';
        lnButton.style.opacity = '1';
        lnButton.style.pointerEvents = 'auto';
        lnButton.classList.remove('hidden-permanently');
        lnButton.onclick = calculateLn; // Восстанавливаем обработчик
    }
}

// Можно вызвать restoreLnButton() из консоли браузера если нужно вернуть кнопку

let proMaxMode = false;
let madnessInterval;
let buttonFunctions = {};
let originalFunctions = {};

// Функция выбора версии (ПРО и ПРОМАКС+)
function showProMaxMessage() {
    if (proMaxMode) {
        alert('ХАОС УЖЕ АКТИВИРОВАН! Обратного пути нет! 🌪️');
        return;
    }

    const selectionScreen = document.createElement('div');
    selectionScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: Arial, sans-serif;
    `;

    selectionScreen.innerHTML = `
        <div style="text-align: center; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 20px; box-shadow: 0 0 50px rgba(0,0,0,0.5);">
            <h1 style="font-size: 48px; margin-bottom: 10px;">🚀 ВЫБОР ВЕРСИИ</h1>
            <p style="font-size: 24px; margin-bottom: 40px;">Необратимое действие</p>

            <div style="display: flex; gap: 30px; justify-content: center;">
                <button id="proVersion" style="
                    padding: 20px 40px;
                    font-size: 24px;
                    background: linear-gradient(45deg, #00b300, #008000);
                    color: white;
                    border: none;
                    border-radius: 15px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: transform 0.3s;
                ">ВЕРСИЯ ПРО</button>

                <button id="proMaxVersion" style="
                    padding: 20px 40px;
                    font-size: 24px;
                    background: linear-gradient(45deg, #ff00ff, #ff0000);
                    color: white;
                    border: none;
                    border-radius: 15px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: transform 0.3s;
                ">ВЕРСИЯ ПРОМАКС+</button>
            </div>

            <div style="margin-top: 30px; font-size: 16px; opacity: 0.8;">
                <div>🎯 ПРО: Удача</div>
                <div>🌪️ ПРОМАКС+: Хаос и безумие</div>
            </div>
        </div>
    `;

    document.body.appendChild(selectionScreen);

    // Обработчики для кнопок выбора
    document.getElementById('proVersion').onclick = function() {
        selectionScreen.remove();
        startProLoading();
    };

    document.getElementById('proMaxVersion').onclick = function() {
        selectionScreen.remove();
        startProMaxLoading();
    };

    // Эффекты при наведении
    const buttons = selectionScreen.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });
}

function startMadnessMode() {
    proMaxMode = true;

    // Меняем внешний вид кнопки
    const proMaxBtn = document.querySelector('.pro-max-button');
    proMaxBtn.style.background = 'linear-gradient(45deg, #ff00ff, #00ffff)';
    proMaxBtn.textContent = 'ПРОМАКС+ АКТИВЕН!';

    // Запускаем безумие
    madnessInterval = setInterval(() => {
        shuffleButtons(); // Перемешиваем функции кнопок
        crazyDisplay();   // Безумный дисплей
        randomEffects();  // Случайные эффекты
    }, 5000);
}

function shuffleButtons() {
    // Случайно меняем функции кнопок местами
    // Это будет настоящий хаос!
}

// Экран загрузки ПРОМАКС+
function startProMaxLoading() {
    const loadingScreen = document.createElement('div');
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #000000, #ff00ff, #000000);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: Arial, sans-serif;
    `;

    loadingScreen.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 72px; margin-bottom: 30px;">⚡</div>
            <h1 style="font-size: 48px; margin-bottom: 20px;">ЗАГРУЖАЕМ ВЕРСИЮ ПРОМАКС+</h1>

            <div style="width: 400px; height: 20px; background: #333; border-radius: 10px; margin: 30px auto; overflow: hidden;">
                <div id="progressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ff00ff, #00ffff); transition: width 0.5s;"></div>
            </div>

            <div id="loadingText" style="font-size: 20px; margin-top: 20px;">
                Инициализация хаоса... 0%
            </div>

            <div style="font-size: 14px; margin-top: 40px; opacity: 0.6;">
                Система готовится к полному безумию!
            </div>
        </div>
    `;

    document.body.appendChild(loadingScreen);

    // Анимация прогресс-бара
    let progress = 0;
    const progressBar = document.getElementById('progressBar');
    const loadingText = document.getElementById('loadingText');

    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;

        progressBar.style.width = progress + '%';

        const messages = [
            'Инициализация хаоса...',
            'Загрузка безумных алгоритмов...',
            'Настройка случайных генераторов...',
            'Активация режима шизофрении...',
            'Подготовка к математическому апокалипсису...',
            'Запуск протокола "Полный П***ц"...'
        ];

        loadingText.innerHTML = messages[Math.floor(Math.random() * messages)] + ' ' + Math.floor(progress) + '%';

        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.remove();
                activateProMaxMode();
            }, 1000);
        }
    }, 300);
}

// Активация безумного режима ПРОМАКС+ (НАВСЕГДА)
function activateProMaxMode() {
    proMaxMode = true;

    // УДАЛЯЕМ оригинальные функции чтобы нельзя было восстановить
    // Не сохраняем их вообще!

    // Меняем кнопку ПРОМАКС+ навсегда
    const proMaxBtn = document.querySelector('.pro-max-button');
    proMaxBtn.style.background = 'linear-gradient(45deg, #ff00ff, #00ffff, #ffff00)';
    proMaxBtn.style.animation = 'rainbow 2s infinite';
    proMaxBtn.textContent = 'ПРОМАКС+ АКТИВЕН!';
    proMaxBtn.onclick = function() {
    };

    // Безумный визуал навсегда
    document.body.style.animation = 'crazyBackground 10s infinite';
    document.querySelector('.calculator').style.animation = 'vibrate 0.3s infinite';

    // Запускаем все виды безумия
    startMadnessMode();
    shuffleButtons(); // Первое перемешивание
    startCrazyMath(); // Безумная математика
    startDisplayMadness(); // Безумный дисплей
    startSoundMadness(); // Звуковой хаос

    // Убираем функцию остановки из других кнопок
    removeAllEscapeRoutes();
}

// Сохраняем оригинальные функции кнопок
function saveOriginalFunctions() {
    const buttons = document.querySelectorAll('.buttons button');
    buttons.forEach(button => {
        originalFunctions[button.textContent] = button.onclick;
    });
}

// Базовая функция безумия (пока заглушка)
function startMadnessMode() {
    // Здесь будет весь хаос из твоих идей
    console.log('Безумие начинается!');
}

// Перемешивание функций кнопок
function shuffleButtons() {
    if (!proMaxMode) return;

    const buttons = document.querySelectorAll('.buttons button');
    const functions = [
        calculateSin, calculateCos, calculateTan, calculateSqrt,
        calculateLn, calculateLog, calculateSquare, calculatePower,
        addPi, clearDisplay, deleteLast, calculate,
        // Безумные функции
        crazyFunction1, crazyFunction2, crazyFunction3
    ];

    buttons.forEach(button => {
        if (Math.random() < 0.8) { // 80% chance to change function
            const randomFunc = functions[Math.floor(Math.random() * functions.length)];
            button.onclick = randomFunc;

            // Случайный текст кнопки
            const crazyTexts = ['?', '!', 'WTF', '404', 'NaN', '∞', '⚡', '🔥', '🎲', '🤪'];
            button.textContent = crazyTexts[Math.floor(Math.random() * crazyTexts.length)];

            // Случайный цвет
            button.style.background = getRandomColor();
        }
    });

    // Восстанавливаем основные кнопки иногда
    if (Math.random() < 0.3) {
        const digitButtons = document.querySelectorAll('button[onclick*="appendToDisplay"]');
        digitButtons.forEach((btn, index) => {
            if (index < 10) btn.textContent = index;
        });
    }
}

// Безумная математика (навсегда)
function startCrazyMath() {
    // Полностью переопределяем calculate
    window.calculate = function() {
        // Всегда безумные результаты!
        const crazyResults = [
            '42', 'π', '∞', 'NaN', '69', '666', '1337', '0.999...',
            Math.random() * 1000, Math.PI * Math.random(), Date.now() % 1000,
            '💥', '🤯', '🎪', '🌪️'
        ];

        const result = crazyResults[Math.floor(Math.random() * crazyResults.length)];
        display.value = result.toString();

        // Всегда добавляем эффект
        display.style.animation = 'flash 0.5s';
        setTimeout(() => display.style.animation = '', 500);
    };
}

// Дисплей живёт своей жизнью
function startDisplayMadness() {
    setInterval(() => {
        if (!proMaxMode) return;

        if (Math.random() < 0.1 && display.value) { // 10% chance
            // Числа сами меняются
            const currentValue = display.value;
            if (!isNaN(parseFloat(currentValue))) {
                const change = (Math.random() - 0.5) * 10;
                display.value = (parseFloat(currentValue) + change).toFixed(3);
            }
        }

        if (Math.random() < 0.05) { // 5% chance
            // Случайные сообщения
            const messages = [
                'Я жив!', 'Помогите!', '42', 'WTF?', 'Ошибка 666',
                'Безумие!', '🎉', '🤯', 'Математика сломана'
            ];
            display.value = messages[Math.floor(Math.random() * messages.length)];
            setTimeout(() => {
                if (display.value === messages[Math.floor(Math.random() * messages.length)]) {
                    display.value = '';
                }
            }, 2000);
        }
    }, 3000);
}

// Звуковые эффекты безумия
function startSoundMadness() {
    // Эмуляция звуков через вибрацию и алерты
    setInterval(() => {
        if (!proMaxMode) return;

        if (Math.random() < 0.1) { // 10% chance for sound effect
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }

            // Случайные всплывающие эмодзи
            if (Math.random() < 0.3) {
                showFloatingEmoji();
            }
        }
    }, 5000);
}

// Летающие эмодзи
function showFloatingEmoji() {
    const emojis = ['🎲', '⚡', '🔥', '💥', '🤪', '🎉', '👻', '💀', '👾'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const floatingEmoji = document.createElement('div');
    floatingEmoji.textContent = emoji;
    floatingEmoji.style.cssText = `
        position: fixed;
        font-size: 30px;
        z-index: 1000;
        pointer-events: none;
        animation: floatUp 2s ease-in-out forwards;
    `;

    // Случайная позиция
    floatingEmoji.style.left = Math.random() * 80 + 10 + '%';
    floatingEmoji.style.top = '80%';

    document.body.appendChild(floatingEmoji);

    setTimeout(() => {
        floatingEmoji.remove();
    }, 2000);
}

// Специальные безумные функции
function crazyFunction1() {
    display.value = 'БУМ! ' + Math.random() * 100;
    document.body.style.background = getRandomColor();
}

function crazyFunction2() {
    display.value = '🎪 ЦИРК! 🎪';
    setTimeout(() => {
        if (display.value === '🎪 ЦИРК! 🎪') display.value = '';
    }, 1500);
}

function crazyFunction3() {
    // Мини-хаос на 5 секунд
    const originalMode = proMaxMode;
    proMaxMode = true;
    setTimeout(() => {
        if (!originalMode) proMaxMode = false;
    }, 5000);
}

// Остановка безумного режима
function stopMadnessMode() {
    proMaxMode = false;

    clearInterval(madnessInterval);

    // Восстанавливаем оригинальные функции
    const buttons = document.querySelectorAll('.buttons button');
    buttons.forEach(button => {
        const originalText = Object.keys(originalFunctions).find(key =>
            originalFunctions[key] === button.onclick
        );
        if (originalText) {
            button.textContent = originalText;
        }
        button.style.background = '';
    });

    // Восстанавливаем нормальный calculate
    window.calculate = originalFunctions['='] || calculate;

    // Восстанавливаем визуал
    document.body.style.animation = '';
    document.querySelector('.calculator').style.animation = '';

    const proMaxBtn = document.querySelector('.pro-max-button');
    proMaxBtn.style.background = '';
    proMaxBtn.style.animation = '';
    proMaxBtn.textContent = 'ВЕРСИЯ ПРОМАКС+';
}

// Случайный цвет
function getRandomColor() {
    return 'hsl(' + Math.random() * 360 + ', 100%, 50%)';
}

// Убираем все возможности вернуться к нормальности
function removeAllEscapeRoutes() {
    // Убираем очистку безумия из других функций
    const originalClearDisplay = clearDisplay;
    window.clearDisplay = function() {
        // Очищаем дисплей но не останавливаем безумие
        display.value = '';
    };

    // Блокируем перезагрузку страницы
    window.addEventListener('beforeunload', function(e) {
        e.preventDefault();
        e.returnValue = 'Вы уверены? Хаос будет потерян!';
    });

    // Перехватываем F5 и Ctrl+R
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
            e.preventDefault();
            alert('НЕТ! Не убежишь от хаоса! 🌪️');
        }
    });
}

// Экран загрузки версии ПРО
function startProLoading() {
    const loadingScreen = document.createElement('div');
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #000000, #00b300, #000000);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: Arial, sans-serif;
    `;

    loadingScreen.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 72px; margin-bottom: 30px;">🎯</div>
            <h1 style="font-size: 48px; margin-bottom: 20px;">ЗАГРУЖАЕМ ВЕРСИЮ ПРО</h1>

            <div style="width: 400px; height: 20px; background: #333; border-radius: 10px; margin: 30px auto; overflow: hidden;">
                <div id="progressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #00b300, #00ff00); transition: width 0.5s;"></div>
            </div>

            <div id="loadingText" style="font-size: 20px; margin-top: 20px;">
                Инициализация точных вычислений... 0%
            </div>

            <div style="font-size: 14px; margin-top: 40px; opacity: 0.6;">
                Калькулятор готовится к безупречной работе
            </div>
        </div>
    `;

    document.body.appendChild(loadingScreen);

    // Анимация прогресс-бара для ПРО версии
    let progress = 0;
    const progressBar = document.getElementById('progressBar');
    const loadingText = document.getElementById('loadingText');

    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10 + 5; // Медленнее и стабильнее
        if (progress > 100) progress = 100;

        progressBar.style.width = progress + '%';

        const messages = [
            'Инициализация точных вычислений...',
            'Калибровка математических алгоритмов...',
            'Оптимизация производительности...',
            'Загрузка научных функций...',
            'Проверка точности вычислений...',
            'Финальная настройка интерфейса...'
        ];

        loadingText.innerHTML = messages[Math.floor(progress / 20)] + ' ' + Math.floor(progress) + '%';

        if (progress >= 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.remove();
                activateProMode();
            }, 1000);
        }
    }, 400); // Медленнее для ощущения стабильности
}

// Активация версии ПРО как игрового автомата
function activateProMode() {
    window.proVersionActive = true;
    window.slotMachineMode = true;

    // Полностью меняем интерфейс калькулятора на игровой автомат
    transformToSlotMachine();

    // Меняем кнопку ПРОМАКС+
    const proMaxBtn = document.querySelector('.pro-max-button');
    proMaxBtn.style.background = 'linear-gradient(45deg, #ffd700, #ff6b00)';
    proMaxBtn.textContent = 'АВТОМАТ ПРО';
    proMaxBtn.onclick = function() {
        alert('🎰 ИГРОВОЙ АВТОМАТ ПРО\n\nНажмите SPIN для вращения!');
    };

    showSlotWelcomeMessage();
}

// Преобразуем калькулятор в игровой автомат (исправленная версия)
function transformToSlotMachine() {
    const calculator = document.querySelector('.calculator');
    const display = document.getElementById('display');
    const buttons = document.querySelector('.buttons');

    // Прячем оригинальные кнопки
    buttons.style.display = 'none';

    // Меняем стиль калькулятора на казино
    calculator.style.background = 'linear-gradient(45deg, #8B0000, #000000)';
    calculator.style.border = '5px solid #ffd700';
    calculator.style.boxShadow = '0 0 30px #ffd700';
    calculator.style.width = '400px'; // Фиксируем ширину

    // Создаем дисплей игрового автомата (3 табло)
    display.style.display = 'none';

    const slotMachineDisplay = document.createElement('div');
    slotMachineDisplay.className = 'slot-machine-display';
    slotMachineDisplay.innerHTML = `
    <div class="slot-container">
        <div class="slot-reel">
            <div class="slot-reel-container" id="reel1">
                <div class="slot-item">7</div>
                <div class="slot-item">0</div>
                <div class="slot-item">1</div>
                <div class="slot-item">5</div>
                <div class="slot-item">3</div>
                <div class="slot-item">9</div>
                <div class="slot-item">7</div>
            </div>
        </div>
        <div class="slot-reel">
            <div class="slot-reel-container" id="reel2">
                <div class="slot-item">7</div>
                <div class="slot-item">0</div>
                <div class="slot-item">1</div>
                <div class="slot-item">5</div>
                <div class="slot-item">3</div>
                <div class="slot-item">9</div>
                <div class="slot-item">7</div>
            </div>
        </div>
        <div class="slot-reel">
            <div class="slot-reel-container" id="reel3">
                <div class="slot-item">7</div>
                <div class="slot-item">0</div>
                <div class="slot-item">1</div>
                <div class="slot-item">5</div>
                <div class="slot-item">3</div>
                <div class="slot-item">9</div>
                <div class="slot-item">7</div>
            </div>
        </div>
    </div>
    <div class="result-display" id="slotResult">Нажмите SPIN для игры!</div>
`;

    calculator.insertBefore(slotMachineDisplay, buttons);

    // Создаем кнопку SPIN
    const spinButton = document.createElement('button');
    spinButton.className = 'spin-button';
    spinButton.textContent = 'SPIN';
    spinButton.onclick = spinSlotMachine;

    calculator.appendChild(spinButton);

    // Добавляем отображение баланса
    const balanceDisplay = document.createElement('div');
    balanceDisplay.className = 'balance-display';
    balanceDisplay.id = 'balance';
    balanceDisplay.textContent = 'Баланс: 1000';
    calculator.insertBefore(balanceDisplay, slotMachineDisplay);

    // Инициализируем переменные
    window.balance = 1000;
    window.isSpinning = false;
}

// Функция вращения автомата
function spinSlotMachine() {
    if (window.isSpinning) return;
    if (window.balance < 10) {
        alert('Недостаточно средств! Игра окончена.');
        return;
    }

    window.isSpinning = true;
    window.balance -= 10;
    updateBalance();

    // Запускаем анимацию вращения всех барабанов
    spinReel('reel1');
    setTimeout(() => spinReel('reel2'), 200);
    setTimeout(() => spinReel('reel3'), 400);

    // Через 2 секунды проверяем результат
    setTimeout(() => {
        checkSlotResult();
        window.isSpinning = false;
    }, 2000);
}

// Вращение одного барабана (исправленная версия)
function spinReel(reelId) {
    const reel = document.getElementById(reelId);
    const items = reel.querySelectorAll('.slot-item');
    const spinDuration = 2000;

    // Случайная конечная позиция (останавливаемся на одном из символов)
    const itemHeight = 100; // Высота одного элемента
    const finalPosition = -Math.floor(Math.random() * 6) * itemHeight;

    // Сбрасываем трансформацию перед анимацией
    reel.style.transition = 'none';
    reel.style.transform = 'translateY(0)';

    // Даем время для сброса
    setTimeout(() => {
        reel.style.transition = `transform ${spinDuration}ms cubic-bezier(0.2, 0.8, 0.3, 1)`;
        reel.style.transform = `translateY(${finalPosition}px)`;
    }, 50);

    // Эффект замедления в конце
    setTimeout(() => {
        reel.style.transition = 'transform 500ms ease-out';
    }, spinDuration - 500);
}

// Проверка результата (исправленная версия)
function checkSlotResult() {
    const reels = ['reel1', 'reel2', 'reel3'];
    const results = [];

    // Получаем символы на линии выплат
    reels.forEach(reelId => {
        const reel = document.getElementById(reelId);
        const computedStyle = window.getComputedStyle(reel);
        const matrix = new DOMMatrixReadOnly(computedStyle.transform);
        const translateY = matrix.m42;

        // Определяем какой символ виден (второй по счету)
        const itemIndex = Math.abs(Math.round(translateY / 100));
        const items = reel.querySelectorAll('.slot-item');

        // Берем символ который находится в середине видимой области
        results.push(items[itemIndex % items.length].textContent);
    });

    // Вычисляем выигрыш
    const winAmount = calculateWin(results);
    window.balance += winAmount;
    updateBalance();

    // Показываем результат
    const resultDisplay = document.getElementById('slotResult');
    resultDisplay.textContent = winAmount > 0 ?
        `🎉 ВЫИГРЫШ: ${winAmount}! 🎉` :
        'Попробуйте еще раз!';

    resultDisplay.className = winAmount > 0 ? 'result-display win' : 'result-display lose';

    // Анимация выигрыша
    if (winAmount > 0) {
        celebrateWin(winAmount);
    }

    // Показываем комбинацию
    console.log('Комбинация:', results.join(' '));
}

// Вычисление выигрыша для цифрового автомата
function calculateWin(results) {
    const [a, b, c] = results.map(Number); // Преобразуем в числа

    // Таблица выплат для цифровых комбинаций
    const paytable = {
        '777': 1000,    // Три семерки - джекпот
        '555': 500,     // Три пятерки
        '333': 300,     // Три тройки
        '999': 250,     // Три девятки
        '111': 200,     // Три единицы
        '000': 150,     // Три нуля
    };

    // Проверяем комбинации
    const combination = results.join('');

    if (a === 7 && b === 7 && c === 7) {
        return 1000; // Джекпот
    }
    else if (a === b && b === c) {
        // Три одинаковые цифры
        return paytable[combination] || 100;
    }
    else if (a === b || b === c || a === c) {
        // Две одинаковые цифры
        return 50;
    }
    else if (a + b + c === 15) {
        // Сумма 15 (как 7+5+3)
        return 75;
    }
    else if (a + b + c === 10) {
        // Сумма 10
        return 50;
    }
    else if (a === 1 && b === 3 && c === 5) {
        // Последовательность 1-3-5
        return 200;
    }
    else if (a === 5 && b === 3 && c === 1) {
        // Обратная последовательность 5-3-1
        return 200;
    }

    return 0;
}

// Обновление баланса
function updateBalance() {
    const balanceDisplay = document.getElementById('balance');
    balanceDisplay.textContent = `Баланс: ${window.balance}`;
    balanceDisplay.className = window.balance < 100 ? 'balance-display low' : 'balance-display';
}

// Анимация выигрыша
function celebrateWin(amount) {
    const resultDisplay = document.getElementById('slotResult');
    resultDisplay.style.animation = 'winPulse 0.5s 3';

    // Создаем летающие деньги
    for (let i = 0; i < 10; i++) {
        createFlyingMoney();
    }

    // Звуковой эффект (вибрация)
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
    }
}

// Создаем летающие цифры вместо денег
function createFlyingMoney() {
    const numbers = ['1', '5', '10', '25', '50', '100', 'π', 'e'];
    const number = document.createElement('div');
    number.textContent = numbers[Math.floor(Math.random() * numbers.length)];
    number.style.cssText = `
        position: fixed;
        font-size: 20px;
        font-weight: bold;
        color: #ffd700;
        z-index: 1000;
        pointer-events: none;
        animation: flyMoney 2s ease-in-out forwards;
        left: ${Math.random() * 100}%;
        top: 100%;
        text-shadow: 0 0 5px #ff6b00;
    `;

    document.body.appendChild(number);

    setTimeout(() => number.remove(), 2000);
}

// Профессиональные улучшения для версии ПРО
function enhanceProVersion() {
    // Улучшаем точность вычислений
    enhanceCalculations();

    // Добавляем профессиональные функции
    addProFeatures();

    // Улучшаем интерфейс
    enhanceProUI();
}

// Улучшаем точность вычислений
function enhanceCalculations() {
    const originalCalculate = window.calculate;

    window.calculate = function() {
        try {
            let expression = display.value;

            if (expression === '') {
                display.value = '0';
                return;
            }

            expression = expression.replace(/×/g, '*');

            // Улучшенная проверка ошибок
            const lastChar = expression[expression.length - 1];
            if (['+', '-', '*', '/', '('].includes(lastChar)) {
                display.value = 'Ошибка: неполное выражение';
                return;
            }

            // Более точное вычисление
            const result = eval(expression);

            if (isNaN(result)) {
                display.value = 'Ошибка: нечисловой результат';
            } else if (!isFinite(result)) {
                display.value = 'Ошибка: бесконечность';
            } else {
                // Высокая точность (15 знаков)
                display.value = parseFloat(result.toFixed(15));
            }

        } catch (error) {
            display.value = 'Ошибка вычисления';
        }
    };
}

// Добавляем CSS для пульсации ПРО версии
const proStyle = document.createElement('style');
proStyle.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }

    .pro-mode {
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.3) !important;
    }
`;
document.head.appendChild(proStyle);

// Приветственное сообщение для версии ПРО
function showProWelcomeMessage() {
    const welcomeMsg = document.createElement('div');
    welcomeMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #00b300, #008000);
        color: white;
        padding: 30px;
        border-radius: 15px;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 0 50px rgba(0, 255, 0, 0.5);
        border: 3px solid #00ff00;
    `;

    welcomeMsg.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 20px;">🎰</div>
    <div>ЦИФРОВОЙ АВТОМАТ ПРО</div>
    <div style="font-size: 18px; margin-top: 15px; opacity: 0.9;">
        Ставка: 10 • Баланс: 1000<br>
        SPIN для вращения барабанов!
    </div>
    <div style="font-size: 14px; margin-top: 20px; opacity: 0.7;">
        777 = 1000 | 555 = 500 | 333 = 300<br>
        999 = 250 | 111 = 200 | 000 = 150
    </div>
    <div style="font-size: 12px; margin-top: 10px; opacity: 0.6;">
        Две одинаковые = 50 | Сумма 15 = 75
    </div>
`;
    document.body.appendChild(welcomeMsg);

    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        welcomeMsg.style.opacity = '0';
        welcomeMsg.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (welcomeMsg.parentNode) {
                welcomeMsg.parentNode.removeChild(welcomeMsg);
            }
        }, 500);
    }, 3000);
}

// Приветственное сообщение для игрового автомата
function showSlotWelcomeMessage() {
    const welcomeMsg = document.createElement('div');
    welcomeMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #8B0000, #000000);
        color: #ffd700;
        padding: 30px;
        border-radius: 15px;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 0 50px #ffd700;
        border: 3px solid #ffd700;
        text-shadow: 0 0 10px #ff6b00;
    `;

    welcomeMsg.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">🎰</div>
        <div>ИГРОВОЙ АВТОМАТ ПРО</div>
        <div style="font-size: 18px; margin-top: 15px; opacity: 0.9;">
            Ставка: 10 • Баланс: 1000<br>
            SPIN для вращения барабанов!
        </div>
        <div style="font-size: 14px; margin-top: 20px; opacity: 0.7;">
            777 = 1000 | 🍒🍒🍒 = 500 | 💎💎💎 = 300
        </div>
    `;

    document.body.appendChild(welcomeMsg);

    setTimeout(() => {
        welcomeMsg.style.opacity = '0';
        welcomeMsg.style.transition = 'opacity 0.5s';
        setTimeout(() => welcomeMsg.remove(), 500);
    }, 4000);
}

//  restoreLnButton()
//  stopChaosMode()