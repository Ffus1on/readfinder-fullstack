(function () {
  try {
    var mapData = document.getElementById('map-data');
    if (!mapData) {
      console.error('Leaflet: map-data element not found');
      return;
    }

    var libraries = JSON.parse(mapData.textContent);
    if (!libraries || libraries.length === 0) {
      console.error('Leaflet: no libraries data');
      return;
    }

    var map = L.map('map').setView([59.93, 30.31], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    var markerIcon = L.divIcon({
      className: 'rf-marker',
      html: '<div class="rf-marker-pin"></div>',
      iconSize: [24, 32],
      iconAnchor: [12, 32],
      popupAnchor: [0, -30],
    });

    var markers = {};
    var bounds = [];

    libraries.forEach(function (lib) {
      if (!lib.lat || !lib.lng) return;
      var lat = Number(lib.lat);
      var lng = Number(lib.lng);
      var marker = L.marker([lat, lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup('<b>' + lib.name + '</b><br>' + (lib.address || ''));
      marker.on('click', function () {
        highlightCard(lib.id);
      });
      markers[lib.id] = marker;
      bounds.push([lat, lng]);
    });

    var focusId = new URLSearchParams(window.location.search).get('library');
    var focusMarker = focusId && markers[focusId] ? markers[focusId] : null;
    if (focusMarker) {
      highlightCard(focusId);
      var focusLatLng = focusMarker.getLatLng();
      map.flyTo([focusLatLng.lat, focusLatLng.lng], 15);
      focusMarker.openPopup();
    } else if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    function highlightCard(id) {
      var cards = document.querySelectorAll('#all-places .place-card');
      cards.forEach(function (card) {
        var active = card.getAttribute('data-id') === id;
        card.classList.toggle('active', active);
        if (active) {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    var list = document.getElementById('all-places');
    if (list) {
      list.addEventListener('click', function (e) {
        var card = e.target.closest('.place-card');
        if (!card) return;
        if (e.target.closest('a, button')) return;

        var lat = Number(card.getAttribute('data-lat'));
        var lng = Number(card.getAttribute('data-lng'));
        var id = card.getAttribute('data-id');
        if (!isNaN(lat) && !isNaN(lng) && markers[id]) {
          map.flyTo([lat, lng], 15);
          markers[id].openPopup();
          highlightCard(id);
        }
      });
    }

    setTimeout(function () {
      map.invalidateSize();
    }, 300);

    window.addEventListener('resize', function () {
      map.invalidateSize();
    });
  } catch (e) {
    console.error('Leaflet init error:', e);
  }
})();
