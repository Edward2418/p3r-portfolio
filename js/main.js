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
