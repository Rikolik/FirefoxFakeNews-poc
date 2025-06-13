const selecionarImagem = document.querySelector('#selecionarImagem');

selecionarImagem.addEventListener("click", async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    await browser.tabs.executeScript(tab.id, {
        file: '/content-scripts/getImage.js'
    });

    console.log('ended');
});