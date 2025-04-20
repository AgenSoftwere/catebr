export interface Parish {
    id: string
    name: string
    address: {
      street?: string
      number?: string
      neighborhood: string
      city: string
      state?: string
      zipCode?: string
    }
    phone: string
    email?: string
    cnpj?: string
    responsibleName?: string
  }
  