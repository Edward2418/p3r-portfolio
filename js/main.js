/* ================================================
   MAIN.JS — Fase 2
   Nuevas responsabilidades:
   1. Splash screen (desaparece al presionar tecla/clic)
   2. Cursor personalizado (sigue al mouse)
   3. Efecto hover del cursor sobre clickeables
   4. Flash de transición entre secciones
   5. Navegación por menú (igual que Fase 1)
   6. Animación de skill bars
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ================================================
     REFERENCIAS AL DOM
     Todas las referencias al inicio — más fácil de mantener
     ================================================ */
  const splashScreen      = document.getElementById('splashScreen');
  const customCursor      = document.getElementById('customCursor');
  const navItems          = document.querySelectorAll('.nav-item');
  const sections          = document.querySelectorAll('.section');
  const skillBars         = document.querySelectorAll('.skill-bar');

  /* El sweepOverlay ya está en el HTML — lo buscamos por id en la sección de transición */


  /* ================================================
     1. CURSOR PERSONALIZADO
     
     Escuchamos 'mousemove' en el documento completo.
     Cada vez que el mouse se mueve, actualizamos la
     posición del div del cursor con style.left y style.top.
     
     Usamos requestAnimationFrame para sincronizar la
     actualización con el ciclo de render del navegador
     (60fps). Sin esto, el cursor podría "temblar" en
     pantallas de alta frecuencia de actualización.
     ================================================ */
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    /* Actualizamos la posición directamente — el CSS se encarga
       del transform: translate(-50%, -50%) para centrarlo */
    customCursor.style.left = mouseX + 'px';
    customCursor.style.top  = mouseY + 'px';
  });

  /* Agrandamos el cursor al pasar sobre elementos interactivos.
     'querySelectorAll' con múltiples selectores separados por coma. */
  const clickables = document.querySelectorAll(
    'a, button, .nav-item, .project-card, .social-card, .system-btn'
  );

  clickables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      customCursor.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      customCursor.classList.remove('cursor-hover');
    });
  });

  /* Ocultamos el cursor si el mouse sale de la ventana */
  document.addEventListener('mouseleave', () => {
    customCursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    customCursor.style.opacity = '1';
  });


  /* ================================================
     2. SPLASH SCREEN
     
     La función dismissSplash() hace desaparecer el splash.
     La llamamos tanto con teclado como con clic/touch,
     para cubrir todos los dispositivos.
     
     Solo la ejecutamos una vez — después de la primera
     llamada, removemos los listeners para no desperdiciar
     recursos. El patrón { once: true } de addEventListener
     hace esto automáticamente.
     ================================================ */
  function dismissSplash() {
    splashScreen.classList.add('hidden');

    /* Después de que termina la transición CSS (600ms),
       removemos el elemento del flujo para liberar memoria */
    setTimeout(() => {
      splashScreen.style.display = 'none';
    }, 650);
  }

  /* Cualquier tecla del teclado */
  document.addEventListener('keydown', dismissSplash, { once: true });

  /* Clic o tap en el splash — útil en móviles */
  splashScreen.addEventListener('click', dismissSplash, { once: true });


  /* ================================================
     3. SWEEP DE TRANSICIÓN ENTRE SECCIONES
     
     El barrido diagonal de P3R funciona en 2 tiempos:
     
     Tiempo 1 — sweepIn (0.25s):
       El panel de color entra desde la izquierda,
       cubriendo la sección anterior.
     
     Tiempo 2 — sweepOut (0.25s):
       Justo cuando el panel cubre todo (en el medio),
       cambiamos la sección. Luego el panel sale hacia
       la derecha, revelando la nueva sección.
     
     El resultado: un "wipe" diagonal rojo-cyan,
     exactamente como en P3R.
     ================================================ */
  const sweepOverlay = document.getElementById('sweepOverlay');

  function flashTransition(callback) {
    /* Fase 1: el sweep entra */
    sweepOverlay.classList.remove('sweep-out');
    sweepOverlay.classList.add('sweep-in');

    /* Cuando termina el sweepIn (250ms), cambiamos la sección
       y arrancamos el sweepOut */
    setTimeout(() => {
      callback(); /* aquí se cambia la sección visible */

      sweepOverlay.classList.remove('sweep-in');
      sweepOverlay.classList.add('sweep-out');

      /* Limpiamos las clases cuando termina el sweepOut */
      setTimeout(() => {
        sweepOverlay.classList.remove('sweep-out');
      }, 260);

    }, 250);
  }


  /* ================================================
     4. NAVEGACIÓN ENTRE SECCIONES
     Igual que Fase 1 pero envuelta en flashTransition
     ================================================ */
  function navigateTo(targetSection) {
    /* Si ya estamos en esa sección, no hacemos nada */
    const currentActive = document.querySelector('.nav-item.active');
    if (currentActive && currentActive.dataset.section === targetSection) return;

    flashTransition(() => {
      /* Desactivar todo */
      navItems.forEach(item => item.classList.remove('active'));
      sections.forEach(sec  => sec.classList.remove('active'));

      /* Activar destino */
      const activeNavItem = document.querySelector(
        `.nav-item[data-section="${targetSection}"]`
      );
      if (activeNavItem) activeNavItem.classList.add('active');

      const activeSection = document.getElementById(targetSection);
      if (activeSection) activeSection.classList.add('active');

      /* Acciones especiales por sección */
      handleSectionEntry(targetSection);
    });
  }


  /* ================================================
     5. ACCIONES ESPECIALES POR SECCIÓN
     ================================================ */
  function handleSectionEntry(sectionName) {
    /* Reseteamos skill bars siempre que salimos de skills */
    if (sectionName !== 'skills') {
      skillBars.forEach(bar => { bar.style.width = '0'; });
    }

    if (sectionName === 'skills') {
      /* Pequeño delay para que la transición de entrada
         de la sección termine antes de animar las barras */
      setTimeout(() => {
        skillBars.forEach(bar => {
          const fillValue = getComputedStyle(bar)
            .getPropertyValue('--skill-fill')
            .trim();
          bar.style.width = fillValue;
        });
      }, 200);
    }
  }


  /* ================================================
     6. EVENTOS DE NAVEGACIÓN

     Click en ítems del menú
     ================================================ */
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.section);
    });
  });

  /* Navegación con flechas del teclado */
  document.addEventListener('keydown', (event) => {
    /* Si el splash sigue visible, solo procesamos
       el dismiss — no la navegación del menú */
    if (!splashScreen.classList.contains('hidden') &&
         splashScreen.style.display !== 'none') return;

    const itemsArray   = Array.from(navItems);
    const currentActive = document.querySelector('.nav-item.active');
    const currentIndex  = itemsArray.indexOf(currentActive);
    let newIndex = currentIndex;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      newIndex = Math.min(currentIndex + 1, itemsArray.length - 1);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
    }

    if (newIndex !== currentIndex) {
      navigateTo(itemsArray[newIndex].dataset.section);
    }
  });


  /* ================================================
     7. INICIALIZACIÓN
     ================================================ */
  navigateTo('about');

  console.log('%c P3R Portfolio · Fase 2 ✓', 'color: #00ccff; font-size: 14px;');

}); /* fin DOMContentLoaded */

/* ================================================
   FASE 3 — Proyectos: filtros y modal
   Este bloque se ejecuta de forma independiente,
   también dentro de DOMContentLoaded.
   Lo separamos al final del archivo para mantener
   organizado el código por fases / responsabilidades.
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ================================================
     DATOS DE LOS PROYECTOS
     
     Guardamos la información de cada proyecto en un
     objeto JavaScript. Esto es una práctica clave:
     separar los DATOS de la PRESENTACIÓN.
     
     Cuando quieras agregar o editar un proyecto,
     solo tocas este objeto — no el HTML.
     El objeto usa el mismo id que data-id en las cards.
  ================================================ */
  const projectsData = {
    1: {
      id: '1',
      title: 'Sistema de Gestión DB',
      lv: '03',
      desc: 'Aplicación de escritorio para administración de bases de datos con operaciones CRUD completas. Incluye interfaz gráfica en Java Swing con conexión a MySQL, manejo de excepciones y validaciones de entrada.',
      status: 'Completado',
      stack: 'Java · MySQL · JDBC',
      type: 'Aplicación de escritorio',
      tags: ['Java', 'SQL', 'MySQL'],
      color: '#ff6600',
      github: 'https://github.com/Edward2418'
    },
    2: {
      id: '2',
      title: 'App Móvil de Tareas',
      lv: '04',
      desc: 'Aplicación Android para gestión de tareas personales con notificaciones locales, almacenamiento en SQLite y sincronización en tiempo real. Desarrollada con arquitectura MVVM.',
      status: 'En desarrollo',
      stack: 'Kotlin · Android · SQLite',
      type: 'Aplicación móvil',
      tags: ['Kotlin', 'Android', 'SQLite'],
      color: '#0055ff',
      github: 'https://github.com/Edward2418'
    },
    3: {
      id: '3',
      title: 'Portafolio Web',
      lv: '05',
      desc: 'Portafolio personal construido con HTML, CSS y JavaScript puro, con estética inspirada en la UI de Persona 3 Reload. Sin frameworks — animaciones CSS nativas, cursor personalizado y sistema de navegación custom.',
      status: 'En desarrollo',
      stack: 'HTML · CSS · JavaScript',
      type: 'Desarrollo web frontend',
      tags: ['HTML/CSS', 'JavaScript'],
      color: '#aa00ff',
      github: 'https://github.com/Edward2418'
    },
    4: {
      id: '4',
      title: 'Sistema de Reportes',
      lv: '02',
      desc: 'Generador de reportes estadísticos con exportación a PDF desde una base de datos relacional. Permite consultas parametrizadas y visualización de datos en tablas formateadas.',
      status: 'Completado',
      stack: 'Java · SQL Server · iText',
      type: 'Herramienta de reportes',
      tags: ['SQL', 'Java'],
      color: '#00aa55',
      github: 'https://github.com/Edward2418'
    }
  };

  /* ================================================
     SISTEMA DE FILTRADO
     
     Lógica:
     1. El usuario hace clic en un filtro (ej: "java")
     2. Marcamos ese filtro como activo
     3. Recorremos TODAS las cards
     4. Si la card tiene "java" en su data-tags → visible
        Si no lo tiene → agregamos la clase .filtered-out
     5. CSS se encarga de la animación con transition
  ================================================ */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      /* Paso 1: marcar el filtro clickeado como activo */
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter; /* "all", "java", "sql"... */

      /* Paso 2: mostrar/ocultar cards */
      projectCards.forEach(card => {
        if (filter === 'all') {
          /* "TODOS": siempre visible */
          card.classList.remove('filtered-out');
        } else {
          /* Leemos data-tags del HTML: "java sql", "html kotlin"... */
          const tags = card.dataset.tags || '';
          /* .includes() busca si el string contiene el filtro */
          if (tags.includes(filter)) {
            card.classList.remove('filtered-out');
          } else {
            card.classList.add('filtered-out');
          }
        }
      });
    });
  });

  /* ================================================
     MODAL DE DETALLE
     
     Lógica:
     1. Clic en "VER DETALLE" → leer data-id del botón
     2. Buscar ese id en projectsData
     3. Inyectar los datos del proyecto en el modal
     4. Agregar clase .open al modal → CSS lo hace visible
     5. Clic en backdrop o botón cerrar → quitar .open
  ================================================ */
  const modal         = document.getElementById('projectModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose    = document.getElementById('modalClose');

  /* Referencias a todos los elementos del modal que vamos a llenar */
  const modalTitle    = document.getElementById('modalTitle');
  const modalLvLabel  = document.getElementById('modalLvLabel');
  const modalLvBig    = document.getElementById('modalLvBig');
  const modalDesc     = document.getElementById('modalDesc');
  const modalStatus   = document.getElementById('modalStatus');
  const modalStack    = document.getElementById('modalStack');
  const modalType     = document.getElementById('modalType');
  const modalTags     = document.getElementById('modalTags');
  const modalLink     = document.getElementById('modalLink');
  const modalImage    = document.getElementById('modalImage');

  /* ---- Función para abrir el modal con los datos de un proyecto ---- */
  function openModal(projectId) {
    const project = projectsData[projectId];
    if (!project) return; /* si no existe ese id, no hacemos nada */

    /* Inyectamos los datos en el DOM.
       textContent es más seguro que innerHTML para texto plano
       porque no interpreta HTML — evita ataques XSS. */
    modalTitle.textContent   = project.title;
    modalLvLabel.textContent = `Lv ${project.lv}`;
    modalLvBig.textContent   = project.lv;
    modalDesc.textContent    = project.desc;
    modalStatus.textContent  = project.status;
    modalStack.textContent   = project.stack;
    modalType.textContent    = project.type;
    modalLink.href           = project.github;

    /* Actualizamos el color de la imagen del modal */
    modalImage.style.background = `
      repeating-linear-gradient(
        -45deg,
        transparent, transparent 15px,
        rgba(255,255,255,0.02) 15px,
        rgba(255,255,255,0.02) 30px
      ),
      linear-gradient(160deg, ${project.color} 0%, #001533 100%)
    `;

    /* Generamos los tags dinámicamente con createElement.
       Primero vaciamos el contenedor, luego lo rellenamos. */
    modalTags.innerHTML = ''; /* vaciar */
    project.tags.forEach(tag => {
      /* createElement crea un elemento sin insertarlo al DOM */
      const span = document.createElement('span');
      span.className = 'tag small';
      span.textContent = tag;
      /* appendChild lo inserta al final del contenedor */
      modalTags.appendChild(span);
    });

    /* Finalmente, hacemos el modal visible */
    modal.classList.add('open');
    /* Bloqueamos el scroll del body mientras el modal está abierto */
    document.body.style.overflow = 'hidden';
  }

  /* ---- Función para cerrar el modal ---- */
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = ''; /* restauramos el scroll */
  }

  /* ---- Asignar el evento de apertura a cada botón de detalle ---- */
  const detailBtns = document.querySelectorAll('.card-detail-btn');
  detailBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.dataset.id;
      openModal(projectId);
    });
  });

  /* ---- Cerrar el modal con el botón X o el backdrop ---- */
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  /* ---- Cerrar con la tecla Escape — comportamiento estándar en modales ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

}); /* fin del segundo DOMContentLoaded de Fase 3 */

/* ================================================
   FASE 5 — Social Links: fichas de personaje
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ================================================
     DATOS DE LOS SOCIAL LINKS
     
     Cada entrada tiene:
     - id:       identificador único
     - name:     nombre del personaje/juego
     - arcana:   la arcana del tarot asignada
     - sub:      origen (anime, saga, etc.)
     - rank:     nivel de vínculo del 1 al 10
     - color:    color representativo
     - icon:     2-3 letras para el ícono circular
     - desc:     descripción personal del vínculo
     - tags:     etiquetas de género/plataforma
     - quote:    frase representativa
     
     Para agregar un nuevo Social Link en el futuro,
     solo añades un objeto más a este array.
  ================================================ */
  const slData = [
    {
      id: 'oguri',
      name: 'Oguri Cap',
      arcana: 'La Estrella',
      sub: 'Uma Musume: Pretty Derby',
      rank: 10,
      color: '#ffaa00',
      icon: 'OG',
      desc: 'La chica salvaje y sin filtros que corre por pura hambre — literal y figurativamente. Oguri Cap representa esa energía sin pretensiones que va directo al objetivo sin importar lo que piensen los demás. Un recordatorio de que la autenticidad siempre gana.',
      tags: ['Uma Musume', 'Anime', 'Gacha', 'Deporte'],
      quote: '"¡Necesito comer antes de correr!" — Oguri Cap, siempre.'
    },
    {
      id: 'leon',
      name: 'Leon S. Kennedy',
      arcana: 'El Mago',
      sub: 'Resident Evil',
      rank: 9,
      color: '#4488ff',
      icon: 'LS',
      desc: 'El agente que sobrevivió Raccoon City, las sombras de Europa y las conspiraciones del gobierno — con el cabello perfecto en todo momento. Leon encarna la resiliencia: sin importar lo que le lancen, sigue adelante. Y tiene las mejores frases de toda la saga.',
      tags: ['Resident Evil', 'Acción', 'Survival Horror', 'Capcom'],
      quote: '"Where\'s everyone going? Bingo?" — Leon S. Kennedy'
    },
    {
      id: 'p3r',
      name: 'Persona 3 Reload',
      arcana: 'El Loco',
      sub: 'Atlus · JRPG',
      rank: 10,
      color: '#00ccff',
      icon: 'P3',
      desc: 'El juego que inspiró este mismo portafolio. P3R es mucho más que un JRPG — es una exploración de la mortalidad, los vínculos humanos y el valor de vivir el presente. La UI que estás viendo ahora mismo es un tributo a su diseño visual único.',
      tags: ['JRPG', 'Atlus', 'Persona', 'PS5', 'PC'],
      quote: '"Memento mori. Recuerda que morirás." — Persona 3'
    },
    {
      id: 're',
      name: 'Resident Evil',
      arcana: 'La Torre',
      sub: 'Capcom · Survival Horror',
      rank: 8,
      color: '#ff3333',
      icon: 'RE',
      desc: 'La saga que definió el survival horror. Desde el primer RPD hasta la isla de los Ganados, Resident Evil combina tensión, acción y narrativa de forma que pocas franquicias logran. El RE4 Remake es posiblemente el juego mejor diseñado de la última década.',
      tags: ['Survival Horror', 'Capcom', 'PC', 'Acción'],
      quote: '"It\'s been a while since I\'ve been to a place like this." — Leon RE4'
    },
    {
      id: 'smg',
      name: 'Super Mario Galaxy',
      arcana: 'El Sol',
      sub: 'Nintendo · Plataformas',
      rank: 9,
      color: '#ffdd00',
      icon: 'MG',
      desc: 'El juego que demuestra que Nintendo no necesita realismo para emocionar. Super Mario Galaxy es pura imaginación convertida en mecánicas: gravedad invertida, planetas diminutos, música orquestada y una escala cósmica que ningún otro juego de plataformas ha repetido.',
      tags: ['Plataformas', 'Nintendo', 'Wii', 'Clásico'],
      quote: '"¡Aquí vamos!" — Mario, siempre optimista.'
    }
  ];

  /* ================================================
     REFERENCIAS AL DOM
  ================================================ */
  const slList       = document.getElementById('slList');
  const slEmptyState = document.getElementById('slEmptyState');
  const slCardDetail = document.getElementById('slCardDetail');

  /* Referencias a los campos del panel de detalle */
  const slArcana     = document.getElementById('slArcana');
  const slDetailName = document.getElementById('slDetailName');
  const slDetailSub  = document.getElementById('slDetailSub');
  const slRankNum    = document.getElementById('slRankNum');
  const slStars      = document.getElementById('slStars');
  const slDetailDesc = document.getElementById('slDetailDesc');
  const slDetailTags = document.getElementById('slDetailTags');
  const slQuote      = document.getElementById('slQuote');

  /* ================================================
     GENERAR LA LISTA DE VÍNCULOS
     
     En lugar de escribir el HTML de cada fila a mano,
     lo generamos dinámicamente con JS.
     
     El patrón es:
     1. Crear el elemento con createElement()
     2. Asignarle clases y contenido
     3. Insertarlo en el contenedor con appendChild()
     
     Esto es exactamente lo que hace React internamente
     cuando renderiza una lista desde un array de datos.
  ================================================ */
  slData.forEach((link, index) => {

    /* Crear la fila */
    const row = document.createElement('div');
    row.className = 'sl-row';
    row.dataset.id = link.id;

    /* El color va como variable CSS inline para que
       el CSS pueda leerlo con var(--sl-color) */
    row.style.setProperty('--sl-color', link.color);

    /* Generar las mini-estrellas para la lista */
    const starsHtml = Array.from({ length: 10 }, (_, i) =>
      i < link.rank ? '★' : '☆'
    ).join('');

    /* Inyectar el HTML interno de la fila */
    row.innerHTML = `
      <div class="sl-row-icon">${link.icon}</div>
      <div class="sl-row-info">
        <span class="sl-row-name">${link.name}</span>
        <span class="sl-row-arcana">${link.arcana}</span>
      </div>
      <div class="sl-row-rank">${starsHtml}</div>
    `;

    /* Evento de selección — clic en la fila */
    row.addEventListener('click', () => {
      selectLink(link, row);
    });

    slList.appendChild(row);

    /* Seleccionamos el primero automáticamente al cargar la sección */
    if (index === 0) {
      /* Usamos setTimeout para esperar a que la sección
         esté visible antes de "simular" el clic */
      setTimeout(() => selectLink(link, row), 100);
    }
  });

  /* ================================================
     FUNCIÓN: selectLink
     
     Recibe el objeto de datos del link seleccionado
     y la fila del DOM, y hace dos cosas:
     1. Marca la fila como activa visualmente
     2. Rellena el panel de detalle con los datos
  ================================================ */
  function selectLink(link, row) {

    /* ---- Actualizar estado activo en la lista ---- */
    /* Quitar .active de todas las filas */
    document.querySelectorAll('.sl-row').forEach(r => r.classList.remove('active'));
    /* Poner .active en la seleccionada */
    row.classList.add('active');

    /* ---- Mostrar el panel de detalle ---- */
    slEmptyState.style.display = 'none';

    /* Ocultamos brevemente el detalle para que la animación
       de fadeInUp se dispare de nuevo al cambiar de personaje */
    slCardDetail.style.display = 'none';

    /* requestAnimationFrame espera al siguiente frame del navegador.
       Esto fuerza al CSS a "resetear" la animación antes de mostrar
       el nuevo contenido. Sin este truco, la animación no se repetiría. */
    requestAnimationFrame(() => {
      slCardDetail.style.display = 'flex';

      /* ---- Rellenar los campos con los datos del link ---- */

      /* El color del detalle como variable CSS en el contenedor */
      slCardDetail.style.setProperty('--sl-color-detail', link.color);

      slArcana.textContent     = link.arcana;
      slDetailName.textContent = link.name;
      slDetailSub.textContent  = link.sub;
      slRankNum.textContent    = link.rank;
      slDetailDesc.textContent = link.desc;
      slQuote.textContent      = link.quote;

      /* ---- Generar estrellas de nivel ---- 
         Array.from({ length: 10 }) crea un array de 10 elementos.
         El segundo argumento es una función que mapea cada índice
         a una estrella llena o vacía según el rank del link. */
      slStars.innerHTML = '';
      Array.from({ length: 10 }, (_, i) => {
        const star = document.createElement('span');
        star.className = 'sl-star' + (i < link.rank ? '' : ' empty');
        star.textContent = '★';
        slStars.appendChild(star);
      });

      /* ---- Generar tags ---- */
      slDetailTags.innerHTML = '';
      link.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag small';
        span.textContent = tag;
        slDetailTags.appendChild(span);
      });
    });
  }

  /* ================================================
     ACTIVAR EL PRIMER LINK AL NAVEGAR A LA SECCIÓN
     
     Observamos cuándo la sección #social se activa
     (recibe la clase .active) para seleccionar
     automáticamente el primer vínculo.
     
     MutationObserver es la API del navegador para
     "observar" cambios en el DOM sin hacer polling.
  ================================================ */
  const socialSection = document.getElementById('social');
  const firstRow      = slList.querySelector('.sl-row');

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === 'class') {
        const isActive = socialSection.classList.contains('active');
        if (isActive && firstRow) {
          setTimeout(() => {
            selectLink(slData[0], firstRow);
          }, 350); /* esperamos a que termine el sweep */
        }
      }
    });
  });

  observer.observe(socialSection, { attributes: true });

}); /* fin Fase 5 */

/* ================================================
   FASE 6 — Ilustraciones SVG animadas por personaje

   Cada personaje tiene su propio SVG.
   Son siluetas estilizadas que cuando el usuario
   tenga una imagen real, simplemente se reemplaza
   el SVG por un <img> con duotono CSS.

   La anatomía de cada SVG sigue el mismo patrón:
   - Una silueta principal (el cuerpo)
   - Detalles de color (acento del personaje)
   - Elementos flotantes decorativos
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- SVGs de cada personaje ----
     Cada función devuelve un string de SVG.
     El parámetro `color` es el color del personaje
     para que los acentos coincidan. */

  const characterSVGs = {

    /* Oguri Cap — silueta de uma musume con orejas de caballo */
    oguri: (color) => `
      <svg viewBox="0 0 220 380" xmlns="http://www.w3.org/2000/svg"
           style="width:100%;height:auto;filter:drop-shadow(0 0 20px ${color}44)">
        <!-- Sombra/base -->
        <ellipse cx="110" cy="370" rx="55" ry="8" fill="rgba(0,0,0,0.3)"/>
        <!-- Cuerpo: falda y chaqueta de jockey -->
        <path d="M75 200 Q70 280 65 360 L155 360 Q150 280 145 200 Z"
              fill="${color}" opacity="0.85"/>
        <!-- Chaqueta superior -->
        <path d="M72 160 Q80 200 110 205 Q140 200 148 160 Q135 145 110 142 Q85 145 72 160Z"
              fill="${color}"/>
        <!-- Rayas de la chaqueta de jockey -->
        <path d="M80 162 Q110 168 140 162 L138 172 Q110 178 82 172Z"
              fill="white" opacity="0.5"/>
        <path d="M78 182 Q110 188 142 182 L140 192 Q110 198 80 192Z"
              fill="white" opacity="0.3"/>
        <!-- Cuello -->
        <rect x="100" y="132" width="20" height="18" rx="4"
              fill="#f0c8a0"/>
        <!-- Cabeza -->
        <ellipse cx="110" cy="110" rx="32" ry="36"
                 fill="#f0c8a0"/>
        <!-- Cabello (largo, marrón oscuro — característico de Oguri Cap) -->
        <path d="M78 90 Q72 130 78 175 Q90 170 95 160 L90 120 Z"
              fill="#3a2008"/>
        <path d="M142 90 Q148 130 142 175 Q130 170 125 160 L130 120 Z"
              fill="#3a2008"/>
        <path d="M82 82 Q90 50 110 48 Q130 50 138 82 Q130 72 110 70 Q90 72 82 82Z"
              fill="#3a2008"/>
        <!-- Flequillo -->
        <path d="M85 88 Q95 78 110 76 Q125 78 135 88 Q125 84 110 83 Q95 84 85 88Z"
              fill="#4a2a0a"/>
        <!-- OREJAS DE CABALLO — el rasgo más icónico de Oguri Cap -->
        <path d="M88 75 Q82 45 90 38 Q96 50 94 72Z"
              fill="#c8a870"/>
        <path d="M90 70 Q85 50 90 44 Q94 54 93 69Z"
              fill="#e8c090"/>
        <path d="M132 75 Q138 45 130 38 Q124 50 126 72Z"
              fill="#c8a870"/>
        <path d="M130 70 Q135 50 130 44 Q126 54 127 69Z"
              fill="#e8c090"/>
        <!-- Ojos (expresión característica de Oguri: relajada/hambrienta) -->
        <ellipse cx="98" cy="112" rx="6" ry="5" fill="#2a1a08"/>
        <ellipse cx="122" cy="112" rx="6" ry="5" fill="#2a1a08"/>
        <ellipse cx="99" cy="111" rx="2.5" ry="2.5" fill="white" opacity="0.6"/>
        <ellipse cx="123" cy="111" rx="2.5" ry="2.5" fill="white" opacity="0.6"/>
        <!-- Sonrisa relajada -->
        <path d="M100 126 Q110 132 120 126" stroke="#c8806a" stroke-width="1.5"
              fill="none" stroke-linecap="round"/>
        <!-- Cola de caballo (sale de la espalda) -->
        <path d="M148 200 Q165 220 160 260 Q155 290 148 310 Q158 290 162 260 Q168 220 152 198Z"
              fill="#3a2008" opacity="0.9"/>
        <!-- Número del dorsal de jockey -->
        <rect x="95" y="215" width="30" height="22" rx="3"
              fill="white" opacity="0.15"/>
        <text x="110" y="230" text-anchor="middle"
              font-family="sans-serif" font-size="11" font-weight="bold"
              fill="white" opacity="0.5">EG</text>
        <!-- Botas de jockey -->
        <path d="M80 340 Q78 360 72 368 L95 368 Q98 358 95 340Z"
              fill="#1a0a00"/>
        <path d="M140 340 Q142 360 148 368 L125 368 Q122 358 125 340Z"
              fill="#1a0a00"/>
        <!-- Destellos decorativos — el brillo de P3R -->
        <circle cx="165" cy="120" r="3" fill="${color}" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="55" cy="180" r="2" fill="${color}" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="170" cy="240" r="4" fill="white" opacity="0.2">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.8s" repeatCount="indefinite"/>
        </circle>
      </svg>`,

    /* Leon S. Kennedy — silueta con chaqueta de cuero y pistola */
    leon: (color) => `
      <svg viewBox="0 0 220 380" xmlns="http://www.w3.org/2000/svg"
           style="width:100%;height:auto;filter:drop-shadow(0 0 20px ${color}44)">
        <ellipse cx="110" cy="370" rx="50" ry="7" fill="rgba(0,0,0,0.3)"/>
        <!-- Pantalón táctico -->
        <path d="M80 220 Q76 300 74 365 L100 365 Q102 300 110 260 Q118 300 120 365 L146 365 Q144 300 140 220Z"
              fill="#2a3040"/>
        <!-- Chaqueta de cuero negra — clásica de Leon RE4 -->
        <path d="M70 155 Q65 220 80 220 L140 220 Q155 220 150 155 Q138 138 110 135 Q82 138 70 155Z"
              fill="#1a1a1a"/>
        <!-- Solapa de la chaqueta -->
        <path d="M110 138 Q100 155 95 175 L110 168 L125 175 Q120 155 110 138Z"
              fill="#2a2a2a"/>
        <!-- Detalle hombros -->
        <path d="M70 158 Q60 165 58 185 Q70 188 80 178 Q72 170 70 158Z"
              fill="#111"/>
        <path d="M150 158 Q160 165 162 185 Q150 188 140 178 Q148 170 150 158Z"
              fill="#111"/>
        <!-- Cuello -->
        <rect x="101" y="128" width="18" height="16" rx="3" fill="#d4a882"/>
        <!-- Cabeza -->
        <ellipse cx="110" cy="105" rx="30" ry="34" fill="#d4a882"/>
        <!-- Cabello rubio largo — el cabello icónico de Leon -->
        <path d="M82 85 Q78 50 85 40 Q92 55 88 82Z" fill="#c8a830"/>
        <path d="M138 85 Q142 50 135 40 Q128 55 132 82Z" fill="#c8a830"/>
        <path d="M84 78 Q90 48 110 45 Q130 48 136 78 Q120 65 110 64 Q100 65 84 78Z"
              fill="#c8a830"/>
        <!-- Mechón lateral característico -->
        <path d="M80 95 Q72 110 75 130 Q84 120 86 105Z" fill="#b89020"/>
        <!-- Ojos (expresión seria/alerta) -->
        <ellipse cx="98" cy="106" rx="5.5" ry="5" fill="#2a3a2a"/>
        <ellipse cx="122" cy="106" rx="5.5" ry="5" fill="#2a3a2a"/>
        <ellipse cx="99" cy="105" rx="2" ry="2" fill="white" opacity="0.5"/>
        <ellipse cx="123" cy="105" rx="2" ry="2" fill="white" opacity="0.5"/>
        <!-- Boca seria -->
        <path d="M102 120 Q110 123 118 120" stroke="#b07060" stroke-width="1.5"
              fill="none" stroke-linecap="round"/>
        <!-- Brazo derecho extendido con pistola -->
        <path d="M150 165 Q170 175 185 185 Q175 195 165 192 Q155 185 148 175Z"
              fill="#1a1a1a"/>
        <!-- Pistola (Blacktail/Matilda) -->
        <rect x="175" y="178" width="30" height="14" rx="2" fill="#333"/>
        <rect x="185" y="192" width="12" height="8" rx="1" fill="#444"/>
        <rect x="175" y="178" width="5" height="14" rx="1" fill="${color}" opacity="0.7"/>
        <!-- Brazo izquierdo -->
        <path d="M70 165 Q55 175 50 195 Q62 198 70 188 Q68 178 70 165Z"
              fill="#1a1a1a"/>
        <!-- Cinturón táctico -->
        <rect x="78" y="216" width="64" height="8" rx="2" fill="#3a4050"/>
        <rect x="106" y="214" width="8" height="12" rx="1" fill="#888"/>
        <!-- Botas -->
        <path d="M78 340 Q76 362 70 370 L98 370 Q100 358 98 340Z" fill="#111"/>
        <path d="M142 340 Q144 362 150 370 L122 370 Q120 358 122 340Z" fill="#111"/>
        <!-- Destellos -->
        <circle cx="58" cy="150" r="2.5" fill="${color}" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0;0.5" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <circle cx="185" cy="160" r="3" fill="${color}" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.2s" repeatCount="indefinite"/>
        </circle>
      </svg>`,

    /* Persona 3 Reload — el Evoker (pistola de invocación) icónico */
    p3r: (color) => `
      <svg viewBox="0 0 220 380" xmlns="http://www.w3.org/2000/svg"
           style="width:100%;height:auto;filter:drop-shadow(0 0 20px ${color}44)">
        <ellipse cx="110" cy="370" rx="50" ry="7" fill="rgba(0,0,0,0.3)"/>
        <!-- Pantalón del uniforme escolar -->
        <path d="M82 220 Q78 300 76 365 L104 365 Q106 300 110 265 Q114 300 116 365 L144 365 Q142 300 138 220Z"
              fill="#1a1a2e"/>
        <!-- Chaqueta del uniforme escolar Gekkoukan (azul marino) -->
        <path d="M72 155 Q67 222 82 222 L138 222 Q153 222 148 155 Q136 138 110 135 Q84 138 72 155Z"
              fill="#1a1a3a"/>
        <!-- Camisa blanca interior -->
        <path d="M102 138 Q100 160 105 180 L110 175 L115 180 Q120 160 118 138Z"
              fill="white" opacity="0.8"/>
        <!-- Corbata roja — uniforme Gekkoukan -->
        <path d="M107 145 Q110 195 110 195 Q113 195 113 145 Q111 140 107 145Z"
              fill="#cc2233"/>
        <!-- Cuello -->
        <rect x="102" y="128" width="16" height="15" rx="3" fill="#d0b090"/>
        <!-- Cabeza -->
        <ellipse cx="110" cy="105" rx="29" ry="33" fill="#d0b090"/>
        <!-- Cabello azul oscuro del protagonista de P3 -->
        <path d="M83 82 Q88 48 110 46 Q132 48 137 82 Q122 68 110 67 Q98 68 83 82Z"
              fill="#1a1a4a"/>
        <path d="M83 85 Q79 110 82 140 Q90 132 92 115 L88 88Z" fill="#1a1a4a"/>
        <path d="M137 85 Q141 110 138 140 Q130 132 128 115 L132 88Z" fill="#1a1a4a"/>
        <!-- Flequillo que cubre un ojo — rasgo icónico del protagonista -->
        <path d="M83 90 Q92 82 105 80 Q100 95 92 102 Q88 97 83 90Z"
              fill="#2a2a5a"/>
        <!-- Auriculares — el accesorio más icónico del protagonista de P3 -->
        <rect x="77" y="95" width="10" height="18" rx="5" fill="#222"/>
        <rect x="78" y="98" width="8" height="12" rx="4" fill="${color}" opacity="0.7"/>
        <rect x="133" y="95" width="10" height="18" rx="5" fill="#222"/>
        <rect x="134" y="98" width="8" height="12" rx="4" fill="${color}" opacity="0.7"/>
        <!-- Cable de los auriculares -->
        <path d="M87 108 Q88 118 96 128" stroke="#333" stroke-width="2"
              fill="none" stroke-linecap="round"/>
        <!-- Ojos (uno cubierto parcialmente por el flequillo) -->
        <ellipse cx="122" cy="108" rx="5" ry="4.5" fill="#1a1a1a"/>
        <ellipse cx="123" cy="107" rx="2" ry="2" fill="white" opacity="0.5"/>
        <!-- Boca neutra -->
        <path d="M104 122 Q110 125 116 122" stroke="#b07060" stroke-width="1.5"
              fill="none" stroke-linecap="round"/>
        <!-- Brazo extendido sosteniendo el EVOKER (la pistola de invocación) -->
        <path d="M72 160 Q55 170 45 185 Q55 198 68 195 Q75 182 75 168Z"
              fill="#1a1a3a"/>
        <!-- EL EVOKER — la pistola que se apoya en la sien, símbolo de P3 -->
        <rect x="18" y="178" width="32" height="11" rx="3" fill="#888"/>
        <rect x="26" y="189" width="10" height="8" rx="1" fill="#777"/>
        <rect x="18" y="178" width="6" height="11" rx="2"
              fill="${color}" opacity="0.9"/>
        <!-- Brillo del Evoker -->
        <circle cx="22" cy="183" r="3" fill="${color}" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="r" values="3;4;3" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <!-- Brazo derecho -->
        <path d="M148 162 Q162 172 168 190 Q156 196 148 188 Q146 176 148 162Z"
              fill="#1a1a3a"/>
        <!-- Emblema de Gekkoukan en la chaqueta -->
        <circle cx="110" cy="175" r="10" fill="none"
                stroke="${color}" stroke-width="1" opacity="0.4"/>
        <text x="110" y="179" text-anchor="middle"
              font-family="sans-serif" font-size="8" fill="${color}" opacity="0.5">P3R</text>
        <!-- Luna llena decorativa — símbolo de P3 -->
        <circle cx="172" cy="80" r="18" fill="none"
                stroke="${color}" stroke-width="1" opacity="0.3"/>
        <circle cx="172" cy="80" r="14" fill="${color}" opacity="0.08"/>
        <!-- Zapatos del uniforme -->
        <path d="M80 345 Q78 360 72 368 L100 368 Q102 356 100 345Z" fill="#111"/>
        <path d="M140 345 Q142 360 148 368 L120 368 Q118 356 120 345Z" fill="#111"/>
        <!-- Destellos azules — colores de P3R -->
        <circle cx="170" cy="160" r="3" fill="${color}" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="45" cy="220" r="2" fill="${color}" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.8s" repeatCount="indefinite"/>
        </circle>
      </svg>`,

    /* Resident Evil — silueta con gas mask y traje táctico */
    re: (color) => `
      <svg viewBox="0 0 220 380" xmlns="http://www.w3.org/2000/svg"
           style="width:100%;height:auto;filter:drop-shadow(0 0 20px ${color}44)">
        <ellipse cx="110" cy="370" rx="50" ry="7" fill="rgba(0,0,0,0.3)"/>
        <!-- Pantalón táctico oscuro -->
        <path d="M80 225 Q76 305 74 365 L102 365 Q104 305 110 268 Q116 305 118 365 L146 365 Q144 305 140 225Z"
              fill="#1a1a1a"/>
        <!-- Chaleco táctico/BSAA -->
        <path d="M68 158 Q63 228 80 228 L140 228 Q157 228 152 158 Q138 140 110 137 Q82 140 68 158Z"
              fill="#2a2a2a"/>
        <!-- Detalle del chaleco: bolsillos y equipo -->
        <rect x="78" y="168" width="18" height="12" rx="2" fill="#333"/>
        <rect x="124" y="168" width="18" height="12" rx="2" fill="#333"/>
        <rect x="96" y="190" width="28" height="16" rx="2" fill="#333"/>
        <!-- Emblema BSAA / Umbrella en el pecho -->
        <circle cx="110" cy="162" r="9" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.7"/>
        <path d="M110 153 L110 171 M101 162 L119 162" stroke="${color}" stroke-width="1.5" opacity="0.7"/>
        <!-- Cuello con protección -->
        <rect x="99" y="130" width="22" height="16" rx="3" fill="#222"/>
        <!-- Cabeza con GAS MASK — icónica de RE -->
        <ellipse cx="110" cy="108" rx="32" ry="35" fill="#222"/>
        <!-- Visor de la máscara (rojo/naranja) -->
        <path d="M84 95 Q110 88 136 95 Q138 112 136 125 Q110 132 84 125 Q82 112 84 95Z"
              fill="${color}" opacity="0.25"/>
        <path d="M86 97 Q110 91 134 97 Q136 112 134 123 Q110 130 86 123 Q84 112 86 97Z"
              fill="${color}" opacity="0.15"/>
        <!-- Línea divisoria de la máscara -->
        <path d="M84 110 Q110 112 136 110" stroke="#333" stroke-width="2" fill="none"/>
        <!-- Filtros del gas mask -->
        <ellipse cx="92" cy="120" rx="8" ry="7" fill="#333"/>
        <ellipse cx="93" cy="120" rx="5" ry="4" fill="#2a2a2a"/>
        <ellipse cx="128" cy="120" rx="8" ry="7" fill="#333"/>
        <ellipse cx="129" cy="120" rx="5" ry="4" fill="#2a2a2a"/>
        <!-- Tubos del gas mask -->
        <path d="M84 122 Q78 128 80 138" stroke="#444" stroke-width="3"
              fill="none" stroke-linecap="round"/>
        <path d="M136 122 Q142 128 140 138" stroke="#444" stroke-width="3"
              fill="none" stroke-linecap="round"/>
        <!-- Reflejos en el visor -->
        <path d="M90 98 Q100 94 115 97" stroke="white" stroke-width="1"
              fill="none" opacity="0.2"/>
        <!-- Brazo con escopeta -->
        <path d="M150 168 Q168 175 185 178 Q184 192 170 194 Q158 188 148 180Z"
              fill="#2a2a2a"/>
        <!-- Escopeta -->
        <rect x="170" y="172" width="38" height="9" rx="2" fill="#1a1a1a"/>
        <rect x="168" y="168" width="14" height="17" rx="2" fill="#222"/>
        <rect x="200" y="172" width="8" height="9" rx="1" fill="#111"/>
        <!-- Brazo izquierdo -->
        <path d="M70 168 Q52 178 48 196 Q62 200 72 190 Q70 180 70 168Z"
              fill="#2a2a2a"/>
        <!-- Botas tácticas -->
        <path d="M78 342 Q75 362 70 370 L100 370 Q102 358 100 342Z" fill="#111"/>
        <rect x="70" y="358" width="30" height="6" rx="2" fill="#1a1a1a"/>
        <path d="M142 342 Q145 362 150 370 L120 370 Q118 358 120 342Z" fill="#111"/>
        <rect x="120" y="358" width="30" height="6" rx="2" fill="#1a1a1a"/>
        <!-- Destellos rojos amenazantes -->
        <circle cx="55" cy="145" r="3" fill="${color}" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="170" cy="200" r="2.5" fill="${color}" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>`,

    /* Super Mario Galaxy — Mario con traje espacial y estrella Luma */
    smg: (color) => `
      <svg viewBox="0 0 220 380" xmlns="http://www.w3.org/2000/svg"
           style="width:100%;height:auto;filter:drop-shadow(0 0 20px ${color}44)">
        <ellipse cx="110" cy="370" rx="50" ry="7" fill="rgba(0,0,0,0.3)"/>
        <!-- Pantalón azul de Mario -->
        <path d="M82 215 Q78 298 76 362 L105 362 Q107 298 110 262 Q113 298 115 362 L144 362 Q142 298 138 215Z"
              fill="#2244aa"/>
        <!-- Tirantes del overol -->
        <rect x="88" y="148" width="10" height="70" rx="3" fill="#2244aa"/>
        <rect x="122" y="148" width="10" height="70" rx="3" fill="#2244aa"/>
        <!-- Camisa roja de Mario -->
        <path d="M74 155 Q68 218 82 218 L138 218 Q152 218 146 155 Q134 140 110 137 Q86 140 74 155Z"
              fill="#cc2211"/>
        <!-- Botones del overol -->
        <circle cx="97" cy="155" r="4" fill="${color}" opacity="0.9"/>
        <circle cx="123" cy="155" r="4" fill="${color}" opacity="0.9"/>
        <!-- Cuello -->
        <rect x="103" y="130" width="14" height="14" rx="3" fill="#e0b090"/>
        <!-- Cabeza (más grande que proporcional — estilo Mario) -->
        <ellipse cx="110" cy="100" rx="36" ry="38" fill="#e0b090"/>
        <!-- GORRA ROJA de Mario — el elemento más icónico -->
        <path d="M74 88 Q76 68 110 65 Q144 68 146 88 Q130 80 110 79 Q90 80 74 88Z"
              fill="#cc2211"/>
        <!-- Visera de la gorra -->
        <path d="M70 90 Q72 96 100 97 L120 97 Q148 96 150 90 Q138 86 110 85 Q82 86 70 90Z"
              fill="#aa1100"/>
        <!-- Emblema M en la gorra -->
        <circle cx="110" cy="75" r="10" fill="white"/>
        <text x="110" y="80" text-anchor="middle"
              font-family="sans-serif" font-size="11" font-weight="bold" fill="#cc2211">M</text>
        <!-- Bigote icónico de Mario -->
        <path d="M90 118 Q110 115 130 118" stroke="#3a2010" stroke-width="5"
              fill="none" stroke-linecap="round"/>
        <!-- Nariz grande -->
        <ellipse cx="110" cy="113" rx="8" ry="6" fill="#d09070"/>
        <!-- Ojos expresivos y grandes -->
        <ellipse cx="95" cy="104" rx="7" ry="7" fill="white"/>
        <ellipse cx="125" cy="104" rx="7" ry="7" fill="white"/>
        <ellipse cx="96" cy="105" rx="4" ry="4" fill="#2244aa"/>
        <ellipse cx="126" cy="105" rx="4" ry="4" fill="#2244aa"/>
        <ellipse cx="97" cy="104" rx="2" ry="2" fill="black"/>
        <ellipse cx="127" cy="104" rx="2" ry="2" fill="black"/>
        <!-- Brillo en los ojos -->
        <circle cx="98" cy="103" r="1.2" fill="white"/>
        <circle cx="128" cy="103" r="1.2" fill="white"/>
        <!-- Orejas -->
        <ellipse cx="74" cy="108" rx="7" ry="8" fill="#e0b090"/>
        <ellipse cx="146" cy="108" rx="7" ry="8" fill="#e0b090"/>
        <!-- Guantes blancos -->
        <ellipse cx="60" cy="195" rx="14" ry="12" fill="white"/>
        <ellipse cx="160" cy="195" rx="14" ry="12" fill="white"/>
        <!-- Brazos -->
        <path d="M74 162 Q62 180 60 195" stroke="#cc2211" stroke-width="16"
              fill="none" stroke-linecap="round"/>
        <path d="M146 162 Q158 180 160 195" stroke="#cc2211" stroke-width="16"
              fill="none" stroke-linecap="round"/>
        <!-- LUMA ESTRELLA — compañera de Mario en Galaxy -->
        <g transform="translate(155, 80)">
          <!-- Cuerpo de la estrella Luma -->
          <path d="M0,-18 L4,-6 L16,-6 L7,2 L10,14 L0,8 L-10,14 L-7,2 L-16,-6 L-4,-6 Z"
                fill="${color}" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="rotate"
                              values="0;10;0;-10;0" dur="2s" repeatCount="indefinite"/>
          </path>
          <!-- Ojos de Luma -->
          <ellipse cx="-4" cy="-2" rx="3" ry="3" fill="#1a1a3a"/>
          <ellipse cx="4" cy="-2" rx="3" ry="3" fill="#1a1a3a"/>
          <circle cx="-3" cy="-3" r="1" fill="white"/>
          <circle cx="5" cy="-3" r="1" fill="white"/>
        </g>
        <!-- Estrellas decorativas flotando -->
        <path d="M50,60 L52,54 L54,60 L60,60 L55,64 L57,70 L52,66 L47,70 L49,64 L44,60 Z"
              fill="${color}" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite"/>
        </path>
        <path d="M32,160 L33,156 L34,160 L38,160 L35,163 L36,167 L33,165 L30,167 L31,163 L28,160 Z"
              fill="white" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite"/>
        </path>
        <!-- Zapatos marrones de Mario -->
        <path d="M78 342 Q74 362 68 370 L104 370 Q106 356 104 342Z" fill="#8B4513"/>
        <path d="M142 342 Q146 362 152 370 L116 370 Q114 356 116 342Z" fill="#8B4513"/>
      </svg>`
  };

  /* ================================================
     INYECTAR EL SVG CUANDO SE SELECCIONA UN LINK
     
     Interceptamos la función selectLink de Fase 5
     buscando el contenedor y actualizando el SVG.
     
     Usamos MutationObserver para detectar cuando
     el panel de detalle cambia de contenido,
     y entonces actualizamos el SVG.
  ================================================ */
  const slIllusFigure  = document.getElementById('slIllusFigure');
  const slIllusBg      = document.getElementById('slIllusBg');
  const slIllusLv      = document.getElementById('slIllusLv');
  const slIllusNameBg  = document.getElementById('slIllusNameBg');
  const slIllusCol     = document.getElementById('slIllusCol');

  /* Observamos cambios en el nombre del detalle —
     cuando cambia, sabemos que se seleccionó un nuevo link */
  const slDetailName = document.getElementById('slDetailName');

  /* Mapa de id → clave del SVG */
  const svgKeyMap = {
    oguri: 'oguri',
    leon:  'leon',
    p3r:   'p3r',
    re:    're',
    smg:   'smg'
  };

  /* Guardamos el id actual para no redibujar si es el mismo */
  let currentLinkId = null;

  const nameObserver = new MutationObserver(() => {
    /* Buscamos la fila activa para obtener el id */
    const activeRow = document.querySelector('.sl-row.active');
    if (!activeRow) return;

    const linkId = activeRow.dataset.id;
    if (linkId === currentLinkId) return; /* ya está dibujado */
    currentLinkId = linkId;

    /* Buscamos los datos del link en slData
       (definido en el DOMContentLoaded de Fase 5) */
    const linkData = document.querySelector(
      `.sl-row[data-id="${linkId}"]`
    );

    /* El color está en la variable CSS del row */
    const color = getComputedStyle(linkData)
      .getPropertyValue('--sl-color').trim() || '#00ccff';

    /* Obtener el SVG correspondiente */
    const svgKey = svgKeyMap[linkId];
    if (!svgKey || !characterSVGs[svgKey]) return;

    /* Actualizar el fondo de la columna de ilustración */
    slIllusBg.style.background = `
      linear-gradient(160deg,
        color-mix(in srgb, ${color} 30%, #000d1a) 0%,
        #000d1a 100%)
    `;

    /* Actualizar el número de nivel */
    const rankNum = document.getElementById('slRankNum');
    if (rankNum) slIllusLv.textContent = rankNum.textContent;

    /* Actualizar el nombre en la franja inferior */
    slIllusNameBg.dataset.name = slDetailName.textContent.toUpperCase();

    /* Animación de sweep en la columna */
    slIllusCol.classList.remove('sweeping');
    void slIllusCol.offsetWidth; /* fuerza reflow para resetear la animación */
    slIllusCol.classList.add('sweeping');

    /* Inyectar el SVG con animación de entrada */
    slIllusFigure.innerHTML = characterSVGs[svgKey](color);
    slIllusFigure.classList.remove('entering');
    void slIllusFigure.offsetWidth; /* reflow */
    slIllusFigure.classList.add('entering');

    /* Limpiar el sweep después de que termina */
    setTimeout(() => slIllusCol.classList.remove('sweeping'), 450);
  });

  /* Observamos cambios en el texto del nombre del detalle */
  if (slDetailName) {
    nameObserver.observe(slDetailName, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

}); /* fin Fase 6 */

/* ================================================
   OGURI CAP — Imagen real (reemplaza el SVG)
   
   Extendemos el sistema de ilustraciones de Fase 6
   para soportar imágenes reales además de SVGs.
   
   Cuando `characterImages[id]` existe, usamos imagen.
   Cuando no existe, el sistema cae al SVG de Fase 6.
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* Mapa de personaje → ruta de imagen real */
  const characterImages = {
    oguri: 'assets/img/oguri-cap.png'
    /* Cuando tengas más imágenes reales, las agregas aquí:
       leon: 'assets/img/leon-kennedy.png',
       p3r:  'assets/img/protagonist-p3.png',
    */
  };

  /* Clases de ajuste específicas por personaje
     (para corregir posición, escala, etc. según la pose) */
  const characterClasses = {
    oguri: 'char-oguri',
    leon:  'char-leon',
    p3r:   'char-p3r',
    re:    'char-re',
    smg:   'char-smg'
  };

  /* Referencias al DOM */
  const slIllusFigure = document.getElementById('slIllusFigure');
  const slIllusCol    = document.getElementById('slIllusCol');

  /* Escuchamos el mismo evento que Fase 6: cambio de nombre en el detalle */
  const slDetailName = document.getElementById('slDetailName');
  if (!slDetailName || !slIllusFigure) return;

  /* Guardamos el último id para detectar cambios */
  let lastId = null;

  const imageObserver = new MutationObserver(() => {
    const activeRow = document.querySelector('.sl-row.active');
    if (!activeRow) return;

    const linkId = activeRow.dataset.id;
    if (linkId === lastId) return;
    lastId = linkId;

    /* Limpiar clases de personaje anteriores */
    Object.values(characterClasses).forEach(cls => {
      slIllusCol.classList.remove(cls);
      slIllusFigure.classList.remove(cls);
    });

    const charClass = characterClasses[linkId] || '';
    if (charClass) {
      slIllusCol.classList.add(charClass);
    }

    /* ¿Tiene imagen real este personaje? */
    if (characterImages[linkId]) {
      /* Usar imagen real */
      slIllusFigure.innerHTML = '';

      const img = document.createElement('img');
      img.src = characterImages[linkId];
      img.alt = slDetailName.textContent;

      /* Mientras carga, mostramos un placeholder sutil */
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';

      img.onload = () => {
        /* La imagen cargó: aplicar clase y animar entrada */
        slIllusFigure.classList.remove('entering');
        if (charClass) slIllusFigure.classList.add(charClass);
        void slIllusFigure.offsetWidth; /* reflow */
        slIllusFigure.classList.add('entering');
        img.style.opacity = '1';
      };

      img.onerror = () => {
        /* Si la imagen falla, el sistema de Fase 6 ya tiene el SVG como fallback */
        console.warn(`Imagen no encontrada: ${characterImages[linkId]}`);
      };

      slIllusFigure.appendChild(img);

    }
    /* Si no tiene imagen real, Fase 6 ya maneja el SVG — no hacemos nada más */
  });

  slDetailName && imageObserver.observe(slDetailName, {
    childList: true,
    characterData: true,
    subtree: true
  });

}); /* fin imagen real */

/* ================================================
   FASE VISUAL 1 — Sistema de partículas flotantes

   Recrea las partículas de luz que flotan en el
   fondo del menú de P3R. Implementación con Canvas 2D:
   - Array de partículas con posición, velocidad y opacidad
   - Cada partícula se mueve lentamente hacia arriba
   - Al salir por arriba reaparece por abajo (loop)
   - requestAnimationFrame para 60fps suaves

   Por qué Canvas y no CSS:
   Canvas permite manejar 60+ partículas independientes
   eficientemente. Hacerlo solo con CSS requeriría 60
   elementos DOM con keyframes distintos — mucho más
   pesado para el navegador.
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  /* Ajustamos el canvas al tamaño de la ventana
     y lo re-ajustamos si cambia (resize) */
  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  /* ---- Definición de cada partícula ---- */
  class Particle {
    constructor() {
      this.reset(true); /* true = posición inicial aleatoria en toda la pantalla */
    }

    reset(randomY = false) {
      /* Posición X aleatoria en toda la pantalla */
      this.x = Math.random() * window.innerWidth;
      /* Si es inicio, Y aleatoria; si es loop, empieza por abajo */
      this.y = randomY
        ? Math.random() * window.innerHeight
        : window.innerHeight + 10;

      /* Velocidades muy lentas — las partículas de P3R son sutiles */
      this.vx = (Math.random() - 0.5) * 0.3; /* deriva horizontal leve */
      this.vy = -(Math.random() * 0.4 + 0.1); /* sube lentamente */

      /* Tamaño pequeño: entre 1 y 3 px */
      this.radius = Math.random() * 1.5 + 0.5;

      /* Opacidad base y velocidad de parpadeo */
      this.opacity     = Math.random() * 0.5 + 0.1;
      this.opacityBase = this.opacity;
      this.opacityDir  = Math.random() > 0.5 ? 0.003 : -0.003;

      /* Color: la mayoría cyan, algunas blancas */
      this.isCyan = Math.random() > 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      /* Parpadeo suave — la opacidad oscila lentamente */
      this.opacity += this.opacityDir;
      if (this.opacity > this.opacityBase + 0.15 ||
          this.opacity < this.opacityBase - 0.15) {
        this.opacityDir *= -1;
      }

      /* Si salió por arriba o los lados, reiniciar por abajo */
      if (this.y < -10 ||
          this.x < -10 ||
          this.x > window.innerWidth + 10) {
        this.reset(false);
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));

      /* Usamos createRadialGradient para que cada partícula
         tenga un centro brillante y bordes difusos — más orgánico */
      const grad = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius * 3
      );

      const color = this.isCyan ? '0, 204, 255' : '255, 255, 255';
      grad.addColorStop(0, `rgba(${color}, 1)`);
      grad.addColorStop(0.4, `rgba(${color}, 0.4)`);
      grad.addColorStop(1, `rgba(${color}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ---- Crear el array de partículas ---- */
  /* 55 partículas es el balance entre densidad visual y rendimiento */
  const PARTICLE_COUNT = 55;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

  /* ---- Loop de animación ---- */
  function animate() {
    /* Limpiar el canvas en cada frame */
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Actualizar y dibujar cada partícula */
    particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    /* requestAnimationFrame sincroniza con el refresh del monitor
       (generalmente 60fps) y pausa cuando la pestaña no es visible,
       ahorrando batería/CPU */
    requestAnimationFrame(animate);
  }

  /* Respeta la preferencia de reducir movimiento del sistema */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!prefersReducedMotion) {
    animate();
  }

}); /* fin partículas */

/* ================================================
   FASE VISUAL 2 — Animación orgánica del fondo

   El filtro SVG ya se anima solo con <animate>.
   Pero agregamos una capa extra de movimiento en JS:
   el fondo se desplaza sutilmente con el mouse,
   creando un efecto de parallax como en P3R cuando
   mueves el joystick en el menú.
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const bgLayer = document.querySelector('.bg-layer');
  const bgGrid  = document.querySelector('.bg-grid');
  if (!bgLayer) return;

  /* Seguimiento suave del mouse con lerp (interpolación lineal).
     En lugar de mover el fondo exactamente con el mouse,
     lo movemos hacia la posición del mouse gradualmente.
     Esto da el movimiento fluido y "pesado" de P3R. */
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  /* La intensidad del parallax — cuánto se mueve el fondo
     respecto al movimiento del mouse. Valores bajos = sutil. */
  const PARALLAX_INTENSITY = 0.012;
  /* El factor de lerp: 0.03 = muy suave (tarda en llegar),
                        0.1  = más rápido.
     P3R se siente pesado y deliberado, por eso usamos 0.04. */
  const LERP_FACTOR = 0.04;

  document.addEventListener('mousemove', (e) => {
    /* Calculamos el desplazamiento relativo al centro de la pantalla.
       Rango: -0.5 a +0.5 en ambos ejes */
    targetX = (e.clientX / window.innerWidth  - 0.5) * PARALLAX_INTENSITY * 100;
    targetY = (e.clientY / window.innerHeight - 0.5) * PARALLAX_INTENSITY * 100;
  });

  /* Función lerp: interpolación lineal entre a y b por factor t.
     Mueve 'a' un porcentaje t hacia 'b' en cada frame.
     Resultado: movimiento que se acelera y desacelera suavemente. */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function animateBg() {
    /* Avanzar currentX/Y hacia targetX/Y */
    currentX = lerp(currentX, targetX, LERP_FACTOR);
    currentY = lerp(currentY, targetY, LERP_FACTOR);

    /* Aplicar el desplazamiento. scale(1.05) ya está en CSS
       para ocultar bordes — el translate no supera ese margen. */
    const transform = `scale(1.05) translate(${currentX}%, ${currentY}%)`;
    bgLayer.style.transform = transform;

    if (bgGrid) {
      /* La cuadrícula se mueve a la mitad de velocidad del fondo
         para crear sensación de profundidad entre capas */
      const gridTransform = `scale(1.08) translate(${currentX * 0.5}%, ${currentY * 0.5}%)`;
      bgGrid.style.transform = gridTransform;
    }

    requestAnimationFrame(animateBg);
  }

  /* No iniciamos el parallax si el usuario prefiere reducir movimiento */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 768;

  if (!prefersReduced && !isMobile) {
    animateBg();
  }

}); /* fin parallax */

/* ================================================
   FASE VISUAL 3 — Personaje en el menú principal

   El personaje aparece al cargar y reacciona
   a la sección activa:
   - En ABOUT: visible y brillante (sección "suya")
   - En el resto: semi-transparente (dimmed)
   Esto evita que compita visualmente con el contenido.
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const menuChar = document.getElementById('menuCharacter');
  if (!menuChar) return;

  /* Entrada con delay — espera a que el splash termine */
  setTimeout(() => {
    menuChar.classList.add('visible');
  }, 800);

  /* Observamos cambios en la sección activa para
     hacer dimmed/visible según corresponda */
  const sections = document.querySelectorAll('.section');

  const sectionObserver = new MutationObserver(() => {
    const activeSection = document.querySelector('.section.active');
    if (!activeSection) return;

    const activeId = activeSection.id;

    /* El personaje se ve completamente solo en About y Social Link.
       En el resto se atenúa para no tapar el contenido. */
    const fullVisibleSections = ['about', 'social'];

    if (fullVisibleSections.includes(activeId)) {
      menuChar.classList.remove('dimmed');
    } else {
      menuChar.classList.add('dimmed');
    }
  });

  sections.forEach(sec => {
    sectionObserver.observe(sec, { attributes: true });
  });

  /* También reaccionamos al hover del sidebar —
     cuando el usuario navega el menú, el personaje
     hace un leve "tilt" hacia el ítem seleccionado,
     como en P3R donde el protagonista gira la cabeza */
  const navItems = document.querySelectorAll('.nav-item');
  const charImg  = document.getElementById('menuCharImg');

  if (charImg) {
    navItems.forEach((item, index) => {
      item.addEventListener('mouseenter', () => {
        /* El personaje se inclina ligeramente según
           qué tan arriba o abajo está el ítem en el menú */
        const totalItems = navItems.length;
        const normalizedPos = (index / (totalItems - 1)) - 0.5; /* -0.5 a +0.5 */
        const tiltY = normalizedPos * 6; /* máximo 3deg de inclinación */

        charImg.style.transform = `rotate(${tiltY}deg)`;
        charImg.style.transition = 'transform 0.3s ease';
      });

      item.addEventListener('mouseleave', () => {
        charImg.style.transform = 'rotate(0deg)';
      });
    });
  }

}); /* fin personaje menú */
