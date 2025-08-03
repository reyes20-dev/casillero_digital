import React, { useState } from 'react';

// Definir tipos
interface FormData {
  departamento: string;
  ciudad: string;
  contenido: string;
  valor: string;
  peso: string;
  tipoCourier: string; // Nuevo campo
}

interface Costs {
  envio: number;
  derechos: number;
  seguro: number;
  impuestos: number;
  total: number;
}

type FormField = keyof FormData;

const ShippingCalculator = () => {
  const [formData, setFormData] = useState<FormData>({
    departamento: '',
    ciudad: '',
    contenido: '',
    valor: '',
    peso: '',
    tipoCourier: 'express' // Valor por defecto
  });

  const [costs, setCosts] = useState<Costs>({
    envio: 0,
    derechos: 0,
    seguro: 0,
    impuestos: 0,
    total: 0
  });

  // Datos de ejemplo para los dropdowns
  const departamentos = [
    'Antioquia',
    'Bogotá D.C.',
    'Valle del Cauca',
    'Atlántico',
    'Santander',
    'Cundinamarca',
    'Bolívar',
    'Córdoba',
    'Tolima',
    'Huila'
  ];

  const ciudadesPorDepartamento: Record<string, string[]> = {
    'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó'],
    'Bogotá D.C.': ['Bogotá'],
    'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Cartago', 'Buga'],
    'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia'],
    'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta'],
    'Cundinamarca': ['Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 'Girardot','Funza','Mosquera','Madrid'],
    'Bolívar': ['Cartagena', 'Magangué', 'Turbaco', 'Arjona'],
    'Córdoba': ['Montería', 'Cereté', 'Lorica', 'Sahagún'],
    'Tolima': ['Ibagué', 'Espinal', 'Melgar', 'Honda'],
    'Huila': ['Neiva', 'Pitalito', 'Garzón', 'La Plata']
  };

  const tiposContenido = [
    'Electrónicos',
    'Ropa y accesorios',
    'Libros y medios',
    'Productos para el hogar',
    'Deportes y recreación',
    'Belleza y cuidado personal',
    'Juguetes',
    'Otros'
  ];

  const tiposCourier = [
    { value: 'express', label: 'Courier Express (DHL, FedEx, UPS) - Rápido' },
    { value: 'standard', label: 'Correo Certificado - Económico' }
  ];

  // Función para manejar cambios en cualquier input del formulario
  const handleInputChange = (field: FormField, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'departamento') {
        newData.ciudad = '';
      }

      return newData;
    });
  };

  // LÓGICA MEJORADA DE CÁLCULO
  const calcularCostos = () => {
    //aqui convertimos los datos valor y peso que son tipo String a Number(usando parseFloat) 
    // y "|| 0" es para que en caso de que el campo este vacio o tenga letras por defecto ponga un 0
    const valor = parseFloat(formData.valor) || 0;
    const peso = parseFloat(formData.peso) || 0;

    //condicion para validar que los campos no esten vacios y en caso de los numeros sean mayor que 0
    if (!formData.departamento || !formData.ciudad || !formData.contenido || valor <= 0 || peso <= 0) {
      alert('Por favor complete todos los campos con valores válidos');
      return;
    }

    // REVISAR Y MEJORAR LA LOGICA DE ACUERDO A LOS PRECIOS ESTABELCIDOS E INVESTIGADOS POR NOSOTROS
    // Tasa de cambio actualizada (enero 2025)
    const tasaUSDaCOP = 4100;
    
    // Factores de ajuste por ciudad (ciudades principales vs secundarias)
    const factorCiudad = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cartagena'].includes(formData.ciudad) ? 1.0 : 1.15;
    
    // --- Cálculo de envío según tipo de courier ---
    let costoInternacionalUSD;
    let costoNacionalCOP;
    
    if (formData.tipoCourier === 'express') {
      // DHL, FedEx, UPS - más rápido pero más caro
      costoInternacionalUSD = Math.max(25, peso * 12.5); // Costo EE.UU. → Colombia
      costoNacionalCOP = Math.max(15000, peso * 8500) * factorCiudad; // Costo Colombia nacional
    } else {
      // Correo certificado - más económico pero más lento
      costoInternacionalUSD = Math.max(15, peso * 8.0); // Costo EE.UU. → Colombia
      costoNacionalCOP = Math.max(12000, peso * 6000) * factorCiudad; // Costo Colombia nacional
    }
    
    const costoNacionalUSD = costoNacionalCOP / tasaUSDaCOP;
    
    // --- Cálculo de cargos extra ---
    let derechosAduana = 0;
    let impuestos = 0;
    let seguro = 0;
    
    // Derechos de aduana mejorados
    const umbralAduana = formData.tipoCourier === 'express' ? 200 : 1000;
    const tasaAduana = formData.contenido === 'Electrónicos' ? 0.15 : 0.10; // Mayor tasa para electrónicos
    if (valor > umbralAduana) {
      derechosAduana = (valor - umbralAduana) * tasaAduana;
      if (formData.contenido === 'Electrónicos') {
        derechosAduana += Math.min(50, valor * 0.05); // Cargo adicional por tecnología
      }
    }

    // Impuestos mejorados
    if (valor > umbralAduana) {
      impuestos = valor * 0.19; // IVA estándar
      if (['Electrónicos', 'Belleza y cuidado personal'].includes(formData.contenido)) {
        impuestos += valor * 0.08; // Impuesto al consumo para productos de lujo
      }
    } else if (formData.contenido === 'Libros y medios') {
      impuestos = 0; // Exención para libros bajo el umbral
    }

    // Seguro mejorado
    if (formData.tipoCourier === 'express') {
      seguro = Math.max(5, valor * 0.015); // Mínimo $5, 1.5% del valor
      if (formData.contenido === 'Electrónicos') {
        seguro += valor * 0.005; // Seguro adicional para electrónicos
      }
    } else {
      seguro = Math.max(2, valor * 0.01); // Mínimo $2, 1% del valor
    }
    
    // --- Cálculo final ---
    const total = costoInternacionalUSD + costoNacionalUSD + derechosAduana + seguro + impuestos + valor;
    
    setCosts({
      envio: parseFloat((costoInternacionalUSD + costoNacionalUSD).toFixed(2)),
      derechos: parseFloat(derechosAduana.toFixed(2)),
      seguro: parseFloat(seguro.toFixed(2)),
      impuestos: parseFloat(impuestos.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 mt-3.5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            {/* Tipo de Courier */}
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-3 text-lg">
                Tipo de Servicio
              </label>
              <select
                value={formData.tipoCourier}
                onChange={(e) => handleInputChange('tipoCourier', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
              >
                {tiposCourier.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Destino del paquete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-700 font-semibold mb-3 text-lg">
                  Destino del paquete
                </label>
                <select
                  value={formData.departamento}
                  onChange={(e) => handleInputChange('departamento', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                >
                  <option value="">Seleccione su departamento...</option>
                  {departamentos.map((dept: string) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-3 text-lg">
                  Ciudad
                </label>
                <select
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  disabled={!formData.departamento}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">Seleccione su municipio...</option>
                  {formData.departamento && ciudadesPorDepartamento[formData.departamento] && ciudadesPorDepartamento[formData.departamento].map((ciudad: string) => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contenido del paquete */}
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-3 text-lg">
                Seleccione el contenido del paquete
              </label>
              <select
                value={formData.contenido}
                onChange={(e) => handleInputChange('contenido', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
              >
                <option value="">Seleccione el contenido de su paquete...</option>
                {tiposContenido.map((tipo: string) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            {/* Valor y Peso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-700 font-semibold mb-3 text-lg">
                  Valor declarado en dólares
                </label>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => handleInputChange('valor', e.target.value)}
                  placeholder="Valor de su producto en dólares..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-3 text-lg">
                  Peso en Kilos
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.peso}
                  onChange={(e) => handleInputChange('peso', e.target.value)}
                  placeholder="Peso aproximado de su paquete..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botón Calcular */}
            <div className="text-center">
              <button
                onClick={calcularCostos}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                calcular
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Resultado</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Costo de envío</span>
                <span className="font-semibold text-gray-800">{formatCurrency(costs.envio)}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Derechos de aduana</span>
                <span className="font-semibold text-gray-800">{formatCurrency(costs.derechos)}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Seguro</span>
                <span className="font-semibold text-gray-800">{formatCurrency(costs.seguro)}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Impuestos</span>
                <span className="font-semibold text-gray-800">{formatCurrency(costs.impuestos)}</span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center py-1">
                <span className="text-blue-600 font-bold text-lg">Valor aproximado</span>
                <span className="font-bold text-green-600 text-lg">{formatCurrency(costs.total)}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 leading-relaxed">
                Recuerde: El valor final de su envío puede variar dependiendo del 
                valor declarado del producto, peso, naturaleza de la mercancía y 
                políticas de importación que apliquen a sus productos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingCalculator;