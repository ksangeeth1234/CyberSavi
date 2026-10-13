import { useEffect, useRef, useState } from 'react'
import { MapPin, Info, Pause, Play } from 'lucide-react'

// Illustrative research locations — NOT real incident locations
const ILLUSTRATIVE_MARKERS = [
  { id: 'colombo', lat: 6.9271, lng: 79.8612, label: 'Colombo', description: 'Western Province — largest urban digital population in Sri Lanka.' },
  { id: 'kandy', lat: 7.2906, lng: 80.6337, label: 'Kandy', description: 'Central Province — significant university student population.' },
  { id: 'galle', lat: 6.0535, lng: 80.2210, label: 'Galle', description: 'Southern Province — coastal research interest area.' },
  { id: 'jaffna', lat: 9.6615, lng: 80.0255, label: 'Jaffna', description: 'Northern Province — multilingual online community.' },
  { id: 'trincomalee', lat: 8.5874, lng: 81.2152, label: 'Trincomalee', description: 'Eastern Province — diverse linguistic demographics.' },
  { id: 'anuradhapura', lat: 8.3114, lng: 80.4037, label: 'Anuradhapura', description: 'North Central Province — growing digital connectivity.' },
]

interface Marker { id: string; lat: number; lng: number; label: string; description: string }

export default function SriLankaMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null)
  const [animated, setAnimated] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [tileError, setTileError] = useState(false)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    let L: any
    import('leaflet').then((mod) => {
      L = mod.default

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [7.8731, 80.7718],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      })

      // OpenStreetMap tile layer (free, no key needed)
      const tileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }
      )

      tileLayer.on('tileerror', () => setTileError(true))
      tileLayer.addTo(map)

      // Add illustrative markers
      ILLUSTRATIVE_MARKERS.forEach((m) => {
        const icon = L.divIcon({
          className: '',
          html: `<div class="relative flex items-center justify-center">
            <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md z-10 relative"></div>
            ${!prefersReducedMotion ? `<div class="absolute w-4 h-4 rounded-full bg-blue-400 opacity-60 animate-ping"></div>` : ''}
          </div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        const marker = L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: Inter, sans-serif; min-width: 160px;">
              <div style="font-weight: 600; color: #1e40af; margin-bottom: 4px; font-size: 14px;">${m.label}</div>
              <div style="color: #475569; font-size: 12px; line-height: 1.4;">${m.description}</div>
              <div style="margin-top: 8px; padding: 4px 8px; background: #fef3c7; border-radius: 6px; font-size: 11px; color: #92400e; font-style: italic;">
                📌 Illustrative research area — simulated data only
              </div>
            </div>`,
            { maxWidth: 220 }
          )
          .on('click', () => setSelectedMarker(m))

        return marker
      })

      leafletMapRef.current = map
      setMapLoaded(true)
    }).catch(() => setMapLoaded(false))

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-[420px] sm:h-[480px] bg-slate-100"
        aria-label="Interactive map showing illustrative research locations in Sri Lanka"
        role="application"
      />

      {/* Fallback if tiles fail */}
      {tileError && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 z-20 pointer-events-none">
          <div className="text-center text-slate-600 text-sm">
            <MapPin className="mx-auto mb-2 text-blue-400" size={32} />
            <p className="font-medium">Map tiles unavailable (offline or rate-limited).</p>
            <p className="text-xs text-slate-500 mt-1">Markers still represent illustrative research areas.</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md border border-slate-200 text-xs max-w-[200px]">
        <p className="font-semibold text-slate-700 mb-2 flex items-center gap-1">
          <Info size={12} className="text-blue-500" /> Legend
        </p>
        <div className="flex items-center gap-2 text-slate-600 mb-1">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block flex-shrink-0"></span>
          Research interest area
        </div>
        <p className="text-slate-400 mt-2 leading-tight italic">
          All locations are illustrative & simulated. Not real incident data.
        </p>
      </div>

      {/* Animation toggle */}
      {!prefersReducedMotion && (
        <div className="absolute top-3 right-3 z-[1000]">
          <button
            onClick={() => setAnimated(!animated)}
            className="bg-white/95 hover:bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm border border-slate-200 flex items-center gap-1.5 transition-colors"
            aria-label={animated ? 'Pause map animations' : 'Resume map animations'}
          >
            {animated ? <Pause size={12} /> : <Play size={12} />}
            {animated ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
    </div>
  )
}
