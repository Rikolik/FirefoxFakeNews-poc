const selecionarImagem = document.querySelector('#selecionarImagem');

selecionarImagem.addEventListener("click", async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    const apiKey = document.querySelector('#apiKey').value;

    await browser.tabs.insertCSS(tab.id, {
        file: '/content-scripts/sweetalert2.min.css'
    });

    await browser.tabs.insertCSS(tab.id, {
        file: '/content-scripts/alert.css'
    });

    await browser.tabs.executeScript(tab.id, {
        file: '/content-scripts/sweetalert2.all.min.js'
    });

    await browser.tabs.executeScript(tab.id, {
        code: `
            var apiKey = "${apiKey}";
            ${await (await fetch('/content-scripts/getImage.js')).text()}
        `
    });

    // await browser.tabs.executeScript(tab.id, {
    //     file: '/content-scripts/getImage.js'
    // });
});