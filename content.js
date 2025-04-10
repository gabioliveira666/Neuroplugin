chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "atualizarEstilo") {
    aplicarEstilos();
    sendResponse({ status: "ok" }); // importante
  }
});

  
  function aplicarEstilos() {
    chrome.storage.sync.get(["modoLeitura", "altoContraste", "modoDestacado", "modoEspacado"], function (data) {
      if (data.modoLeitura) {
        document.body.style.background = "#f4f4f4";
        document.body.style.color = "#333";
      }
  
      if (data.altoContraste) {
        document.body.style.filter = "contrast(150%)";
      }
  
      if (data.modoDestacado) {
        aplicarModoDestacado();
      }
  
      if (data.modoEspacado) {
        aplicarModoEspacado();
      } else {
        removerModoEspacado();
      }
      if (data.protanomalia) aplicarFiltroDaltonismo("protanomalia");
      else removerFiltroDaltonismo("protanomalia");

      if (data.deuteranomalia) aplicarFiltroDaltonismo("deuteranomalia");
      else removerFiltroDaltonismo("deuteranomalia");

      if (data.tritanopia) aplicarFiltroDaltonismo("tritanopia");
      else removerFiltroDaltonismo("tritanopia");
    });
  }
  
  function aplicarModoDestacado() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
  
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentNode && node.nodeValue.trim()) {
        nodes.push(node);
      }
    }
  
    for (const node of nodes) {
      const words = node.nodeValue.split(/\s+/);
      const span = document.createElement("span");
  
      for (let word of words) {
        if (!word) continue;
        const b = document.createElement("b");
        b.textContent = word.slice(0, 2);
        const rest = document.createTextNode(word.slice(2) + " ");
        span.appendChild(b);
        span.appendChild(rest);
      }
  
      const parent = node.parentNode;
      if (parent) {
        parent.replaceChild(span, node);
      }
    }
  }
  
  function aplicarModoEspacado() {
    document.body.style.letterSpacing = "0.12em";
    document.body.style.wordSpacing = "0.2em";
  }
  
  function removerModoEspacado() {
    document.body.style.letterSpacing = "";
    document.body.style.wordSpacing = "";
  }

  function aplicarFiltroDaltonismo(tipo) {
    const filtros = {
      protanomalia: `
        <filter id="protanomalia-filter">
          <feColorMatrix type="matrix" values="
            0.817, 0.183, 0.000, 0, 0,
            0.333, 0.667, 0.000, 0, 0,
            0.000, 0.125, 0.875, 0, 0,
            0,     0,     0,     1, 0" />
        </filter>
      `,
      deuteranomalia: `
        <filter id="deuteranomalia-filter">
          <feColorMatrix type="matrix" values="
            0.800, 0.200, 0.000, 0, 0,
            0.258, 0.742, 0.000, 0, 0,
            0.000, 0.142, 0.858, 0, 0,
            0,     0,     0,     1, 0" />
        </filter>
      `,
      tritanopia: `
        <filter id="tritanopia-filter">
          <feColorMatrix type="matrix" values="
            0.967, 0.033, 0.000, 0, 0,
            0.000, 0.733, 0.267, 0, 0,
            0.000, 0.183, 0.817, 0, 0,
            0,     0,     0,     1, 0" />
        </filter>
      `
    };
  
    const id = `${tipo}-filter-style`;
    const svgId = `svg-${tipo}`;
  
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        html { filter: url(#${tipo}-filter); }
        svg#${svgId} { height: 0; width: 0; position: absolute; }
      `;
      document.head.appendChild(style);
  
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("id", svgId);
      svg.innerHTML = filtros[tipo];
      document.body.appendChild(svg);
    }
  }
  
  function removerFiltroDaltonismo(tipo) {
    const style = document.getElementById(`${tipo}-filter-style`);
    if (style) style.remove();
  
    const svg = document.getElementById(`svg-${tipo}`);
    if (svg) svg.remove();
  }
  
    
  

