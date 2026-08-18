export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      mazos: {
        Row: {
          id: string
          usuario_id: string
          nombre: string
          descripcion: string
          creado_en: string
        }
        Insert: {
          id?: string
          usuario_id: string
          nombre: string
          descripcion?: string
          creado_en?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          nombre?: string
          descripcion?: string
          creado_en?: string
        }
        Relationships: []
      }
      tarjetas: {
        Row: {
          id: string
          mazo_id: string
          usuario_id: string
          anverso: string
          reverso: string
          repeticiones: number
          factor_facilidad: number
          intervalo: number
          proximo_repaso: string
          creado_en: string
        }
        Insert: {
          id?: string
          mazo_id: string
          usuario_id: string
          anverso: string
          reverso: string
          repeticiones?: number
          factor_facilidad?: number
          intervalo?: number
          proximo_repaso?: string
          creado_en?: string
        }
        Update: {
          id?: string
          mazo_id?: string
          usuario_id?: string
          anverso?: string
          reverso?: string
          repeticiones?: number
          factor_facilidad?: number
          intervalo?: number
          proximo_repaso?: string
          creado_en?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tarjetas_mazo_id_fkey'
            columns: ['mazo_id']
            isOneToOne: false
            referencedRelation: 'mazos'
            referencedColumns: ['id']
          }
        ]
      }
      notas: {
        Row: {
          id: string
          usuario_id: string
          titulo: string
          contenido: string
          creado_en: string
          actualizado_en: string
        }
        Insert: {
          id?: string
          usuario_id: string
          titulo: string
          contenido?: string
          creado_en?: string
          actualizado_en?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          titulo?: string
          contenido?: string
          creado_en?: string
          actualizado_en?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Mazo = Database['public']['Tables']['mazos']['Row']
export type Tarjeta = Database['public']['Tables']['tarjetas']['Row']
export type Nota = Database['public']['Tables']['notas']['Row']
