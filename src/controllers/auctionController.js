const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// Crear subasta (solo vendedores)
exports.createAuction = async (req, res) => {
  try {
    console.log('=== CREAR SUBASTA ===');
    console.log('Body recibido:', req.body);
    console.log('Usuario:', req.user);
    console.log('Archivos:', req.files);

    // Destructurar con los nombres correctos que vienen del frontend
    const { title, brand, model, year, description, basePrice, endDate } = req.body;

    // Validaciones básicas
    if (!title || !brand || !model || !year || !basePrice || !endDate) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        received: { title, brand, model, year, basePrice, endDate }
      });
    }

    // Procesar imágenes subidas (si existen)
    let image_url = null;
    if (req.files && req.files.length > 0) {
      // Guardar la primera imagen como principal
      image_url = `/uploads/vehicles/${req.files[0].filename}`;
      console.log(`Imágenes subidas: ${req.files.length}`);
      console.log('Imagen principal:', image_url);
      
      // TODO: Si quieres guardar múltiples imágenes, crear tabla vehicle_images
      // Por ahora solo usamos la primera
    }

    // Validar y convertir fecha
    const endTime = new Date(endDate);
    console.log('Fecha parseada:', endTime);
    
    if (isNaN(endTime.getTime())) {
      return res.status(400).json({
        error: 'Fecha de finalización inválida.',
        endDate: endDate
      });
    }

    // Validar que la fecha sea futura
    if (endTime <= new Date()) {
      return res.status(400).json({
        error: 'La fecha de finalización debe ser futura.'
      });
    }

    // Validar año
    const yearNum = parseInt(year);
    if (yearNum < 1990 || yearNum > new Date().getFullYear() + 1) {
      return res.status(400).json({
        error: 'Año inválido'
      });
    }

    // Validar precio
    const price = parseFloat(basePrice);
    if (price < 100) {
      return res.status(400).json({
        error: 'El precio debe ser mayor a $100'
      });
    }

    // Preparar datos para insertar (con los nombres que espera la BD)
    const auctionData = {
      title: title.trim(),
      brand: brand.trim(),
      model: model.trim(),
      year: yearNum,
      description: description ? description.trim() : '',
      base_price: price,
      end_time: endTime,
      image_url: image_url,
      vendedor_id: req.user.id
    };

    console.log('Datos a insertar en BD:', auctionData);

    // Insertar en la base de datos
    const auctionId = await Auction.create(auctionData);
    console.log('✓ Subasta creada con ID:', auctionId);

    // Obtener la subasta completa
    const auction = await Auction.findById(auctionId);
    console.log('✓ Subasta obtenida:', auction);

    res.status(201).json({
      message: 'Subasta creada exitosamente',
      auction: {
        id: auction.id,
        title: auction.title,
        brand: auction.brand,
        model: auction.model,
        year: auction.year,
        description: auction.description,
        basePrice: parseFloat(auction.base_price),
        currentBid: parseFloat(auction.current_bid),
        endTime: auction.end_time,
        vendedor: `${auction.seller_name} ${auction.seller_lastname}`,
        vendedor_id: auction.vendedor_id,
        status: 'active',
        imageUrl: auction.image_url
      }
    });
    
  } catch (error) {
    console.error('✗ Error al crear subasta:', error);
    res.status(500).json({
      error: 'Error al crear subasta.',
      details: error.message
    });
  }
};

// Obtener todas las subastas activas
exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.findAllActive();
    
    console.log(`Subastas encontradas: ${auctions.length}`);

    // Formatear las subastas para el frontend
    const formattedAuctions = auctions.map(auction => ({
      id: auction.id,
      title: auction.title,
      brand: auction.brand,
      model: auction.model,
      year: auction.year,
      description: auction.description,
      basePrice: parseFloat(auction.base_price),
      currentBid: parseFloat(auction.current_bid),
      endTime: auction.end_time,
      endDate: auction.end_time, // Para compatibilidad con frontend
      vendedor: `${auction.seller_name} ${auction.seller_lastname}`,
      vendedor_id: auction.vendedor_id,
      status: auction.status === 'activo' ? 'active' : auction.status,
      imageUrl: auction.image_url,
      bidCount: auction.bid_count || 0,
      color: 'bg-neutral-800' // Color por defecto para el tema
    }));

    res.json({
      count: formattedAuctions.length,
      auctions: formattedAuctions // IMPORTANTE: Devolver el array formateado
    });
  } catch (error) {
    console.error('Error al obtener subastas:', error);
    res.status(500).json({
      error: 'Error al obtener subastas.',
      details: error.message
    });
  }
};

// Obtener subasta por ID
exports.getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        error: 'Subasta no encontrada.'
      });
    }

    // Obtener historial de pujas
    const bids = await Bid.findByAuction(id);

    // Formatear para el frontend
    const formattedAuction = {
      id: auction.id,
      title: auction.title,
      brand: auction.brand,
      model: auction.model,
      year: auction.year,
      description: auction.description,
      basePrice: parseFloat(auction.base_price),
      currentBid: parseFloat(auction.current_bid),
      endTime: auction.end_time,
      endDate: auction.end_time,
      vendedor: `${auction.seller_name} ${auction.seller_lastname}`,
      vendedor_id: auction.vendedor_id,
      status: auction.status === 'activo' ? 'active' : auction.status,
      imageUrl: auction.image_url,
      bidCount: auction.bid_count || 0,
      color: 'bg-neutral-800',
      sellerInfo: {
        name: auction.seller_name,
        lastname: auction.seller_lastname,
        email: auction.seller_email,
        phone: auction.seller_phone
      }
    };

    res.json({
      auction: formattedAuction,
      bids
    });
  } catch (error) {
    console.error('Error al obtener subasta:', error);
    res.status(500).json({
      error: 'Error al obtener subasta.',
      details: error.message
    });
  }
};

// Buscar subastas con filtros
exports.searchAuctions = async (req, res) => {
  try {
    const filters = {
      brand: req.query.brand,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      year: req.query.year
    };

    const auctions = await Auction.search(filters);

    const formattedAuctions = auctions.map(auction => ({
      id: auction.id,
      title: auction.title,
      brand: auction.brand,
      model: auction.model,
      year: auction.year,
      basePrice: parseFloat(auction.base_price),
      currentBid: parseFloat(auction.current_bid),
      endTime: auction.end_time,
      vendedor: `${auction.seller_name} ${auction.seller_lastname}`,
      status: auction.status === 'activo' ? 'active' : auction.status,
      bidCount: auction.bid_count || 0,
      color: 'bg-neutral-800'
    }));

    res.json({
      count: formattedAuctions.length,
      filters,
      auctions: formattedAuctions
    });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({
      error: 'Error al buscar subastas.',
      details: error.message
    });
  }
};


// Obtener subastas del vendedor autenticado
exports.getMyAuctions = async (req, res) => {
  try {
    const auctions = await Auction.findBySeller(req.user.id);

    const formattedAuctions = auctions.map(auction => ({
      id: auction.id,
      title: auction.title,
      brand: auction.brand,
      model: auction.model,
      year: auction.year,
      basePrice: parseFloat(auction.base_price),
      currentBid: parseFloat(auction.current_bid),
      endTime: auction.end_time,
      status: auction.status === 'activo' ? 'active' : auction.status,
      bidCount: auction.bid_count || 0,
      color: 'bg-neutral-800'
    }));

    res.json({
      count: formattedAuctions.length,
      auctions: formattedAuctions
    });
  } catch (error) {
    console.error('Error al obtener mis subastas:', error);
    res.status(500).json({
      error: 'Error al obtener tus subastas.',
      details: error.message
    });
  }
};


// Cancelar subasta (solo el vendedor)
exports.cancelAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        error: 'Subasta no encontrada.'
      });
    }

    // Verificar que sea el dueño
    if (auction.vendedor_id !== req.user.id) {
      return res.status(403).json({
        error: 'No tienes permiso para cancelar esta subasta.'
      });
    }

    // Verificar que esté activa
    if (auction.status !== 'activo') {
      return res.status(400).json({
        error: 'Solo se pueden cancelar subastas activas.'
      });
    }

    await Auction.cancel(id);

    res.json({
      message: 'Subasta cancelada exitosamente'
    });
  } catch (error) {
    console.error('Error al cancelar subasta:', error);
    res.status(500).json({
      error: 'Error al cancelar subasta.',
      details: error.message
    });
  }
};

// Cerrar subasta automáticamente (cron job o manual)
exports.closeAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) {
      return res.status(404).json({
        error: 'Subasta no encontrada.'
      });
    }

    // Verificar que el tiempo haya expirado
    const now = new Date();
    const endTime = new Date(auction.end_time);

    if (now < endTime) {
      return res.status(400).json({
        error: 'La subasta aún no ha finalizado.'
      });
    }

    // Obtener ganador (puja más alta)
    const highestBid = await Bid.getHighestBid(id);
    const winnerId = highestBid ? highestBid.user_id : null;

    await Auction.close(id, winnerId);

    res.json({
      message: 'Subasta cerrada exitosamente',
      winner_id: winnerId,
      winning_bid: highestBid ? highestBid.amount : null
    });
  } catch (error) {
    console.error('Error al cerrar subasta:', error);
    res.status(500).json({
      error: 'Error al cerrar subasta.',
      details: error.message
    });
  }
};