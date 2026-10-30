// Mode switch
function setMode(mode) {
    const forwardForm = document.querySelector("#forward-form");
    const reverseForm = document.querySelector("#reverse-form");
    const btnForward = document.querySelector("#btn-forward");
    const btnReverse = document.querySelector("#btn-reverse");
    const results = document.querySelector("#results");
    const error = document.querySelector("#error");

    error.textContent = "";
    results.style.display = "none";

    if (mode === "forward") {
        forwardForm.style.display = "block";
        reverseForm.style.display = "none";
        btnForward.classList.add("active");
        btnReverse.classList.remove("active");
    } else {
        forwardForm.style.display = "none";
        reverseForm.style.display = "block";
        btnForward.classList.remove("active");
        btnReverse.classList.add("active");
    }
}


// Forward: Ra, Rb, C → frequency, duty, period
function onForwardClick(event) {
    event.preventDefault();

    let ra = parseFloat(document.querySelector("#ra").value)
           * parseFloat(document.querySelector("#ra-unit").value);

    let rb = parseFloat(document.querySelector("#rb").value)
           * parseFloat(document.querySelector("#rb-unit").value);

    let c = parseFloat(document.querySelector("#c").value)
          * parseFloat(document.querySelector("#c-unit").value);

    let results = document.querySelector("#results");
    let error = document.querySelector("#error");

    if (!Number.isFinite(ra) || !Number.isFinite(rb) ||
        !Number.isFinite(c) || ra <= 0 || rb <= 0 || c <= 0) {

        error.textContent = "Please enter valid positive values!";
        results.style.display = "none";
        return;
    }

    let highTime = 0.693 * (ra + rb) * c;
    let lowTime = 0.693 * rb * c;

    let period = highTime + lowTime;
    let frequency = 1 / period;
    let dutyCycle = highTime / period * 100;

    if (!Number.isFinite(frequency) || frequency <= 0) {
        error.textContent = "Values are outside the supported range!";
        results.style.display = "none";
        return;
    }

    // Display
    document.querySelector("#result1-label").textContent = "Frequency";
    document.querySelector("#result2-label").textContent = "Duty Cycle";
    document.querySelector("#result3-label").textContent = "Period";

    let unit = "Hz";
    let freqDisplay = frequency;

    if (frequency >= 1000000) {
        freqDisplay /= 1000000;
        unit = "MHz";
    } else if (frequency >= 1000) {
        freqDisplay /= 1000;
        unit = "kHz";
    }

    document.querySelector("#result1").textContent = `${freqDisplay.toFixed(2)} ${unit}`;
    document.querySelector("#result2").textContent = `${dutyCycle.toFixed(2)}%`;
    document.querySelector("#result3").textContent = formatTime(period);

    document.querySelector("#high-time").textContent = formatTime(highTime);
    document.querySelector("#low-time").textContent = formatTime(lowTime);

    drawWaveform(dutyCycle);

    error.textContent = "";
    results.style.display = "block";
}


// Reverse: f, D, C → Ra, Rb
function onReverseClick(event) {
    event.preventDefault();

    let f = parseFloat(document.querySelector("#f").value)
          * parseFloat(document.querySelector("#f-unit").value);

    let dPercent = parseFloat(document.querySelector("#d").value);
    let D = dPercent / 100;

    let c = parseFloat(document.querySelector("#c-rev").value)
          * parseFloat(document.querySelector("#c-rev-unit").value);

    let results = document.querySelector("#results");
    let error = document.querySelector("#error");

    if (!Number.isFinite(f) || !Number.isFinite(dPercent) || !Number.isFinite(c) ||
        f <= 0 || c <= 0 || dPercent < 50 || dPercent > 100) {

        error.textContent = "Please enter valid values! Duty cycle must be 50–100%.";
        results.style.display = "none";
        return;
    }

    // R1 = Ra, R2 = Rb
    let ra = (1.44 * (2 * D - 1)) / (f * c);
    let rb = (1.44 * (1 - D)) / (f * c);

    if (!Number.isFinite(ra) || !Number.isFinite(rb) || ra < 0 || rb <= 0) {
        error.textContent = "Values are outside the supported range!";
        results.style.display = "none";
        return;
    }

    // Recalculate times for waveform and display
    let highTime = 0.693 * (ra + rb) * c;
    let lowTime = 0.693 * rb * c;
    let period = highTime + lowTime;

    // Display
    document.querySelector("#result1-label").textContent = "Ra";
    document.querySelector("#result2-label").textContent = "Rb";
    document.querySelector("#result3-label").textContent = "Period";

    document.querySelector("#result1").textContent = formatResistance(ra);
    document.querySelector("#result2").textContent = formatResistance(rb);
    document.querySelector("#result3").textContent = formatTime(period);

    document.querySelector("#high-time").textContent = formatTime(highTime);
    document.querySelector("#low-time").textContent = formatTime(lowTime);

    drawWaveform(dPercent);

    error.textContent = "";
    results.style.display = "block";
}


// Convert time to convenient units
function formatTime(time) {

    if (time >= 1) {
        return `${time.toFixed(2)} s`;
    } else if (time >= 0.001) {
        return `${(time * 1000).toFixed(2)} ms`;
    } else if (time >= 0.000001) {
        return `${(time * 1000000).toFixed(2)} µs`;
    } else {
        return `${(time * 1000000000).toFixed(2)} ns`;
    }
}


// Convert resistance to convenient units
function formatResistance(r) {

    if (r >= 1000000) {
        return `${(r / 1000000).toFixed(2)} MΩ`;
    } else if (r >= 1000) {
        return `${(r / 1000).toFixed(2)} kΩ`;
    } else {
        return `${r.toFixed(2)} Ω`;
    }
}


// Draw rectangular signal
function drawWaveform(dutyCycle) {

    let periodWidth = 150;
    let highWidth = periodWidth * dutyCycle / 100;

    let path = "M 20 120";

    // Draw 3 periods
    for (let i = 0; i < 3; i++) {

        let x = 20 + i * periodWidth;

        path += ` L ${x} 30`;
        path += ` L ${x + highWidth} 30`;
        path += ` L ${x + highWidth} 120`;
        path += ` L ${x + periodWidth} 120`;
    }

    document.querySelector("#wave-path").setAttribute("d", path);
}


// Show or hide background menu
function toggleColors() {

    let menu = document.querySelector("#colorMenu");

    menu.style.display =
        menu.style.display === "block" ? "none" : "block";
}


// Change background color
function changeBackground(color) {

    document.body.style.backgroundColor = color;

    document.body.classList.toggle(
        "dark-theme", color === "#222222"
    );

    document.querySelector("#colorMenu").style.display = "none";
}