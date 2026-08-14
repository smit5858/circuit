const { CarModule, CarModulePart } = require("../models");

// POST /api/modules/image
exports.getModuleImage = async (req, res) => {
  try {
    const { carModelId, name, side } = req.query;
    if (!carModelId || !name || !side) {
      return res.status(400).json({ message: "carModelId, name and side are required" });
    }

    const carModule = await CarModule.findOne({ where: { carModelId, name } });
    if (!carModule) return res.status(404).json({ message: "Module not found" });

    const imageBuffer = side === "side1" ? carModule.side1Image : carModule.side2Image;
    const mimeType = side === "side1" ? carModule.side1ImageMime : carModule.side2ImageMime;
    if (!imageBuffer) return res.status(404).json({ message: `No image for ${side}` });

    res.json({
      carModuleId: carModule.id,
      side,
      mimeType,
      image: `data:${mimeType};base64,${imageBuffer.toString("base64")}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/modules/parts
exports.getModuleParts = async (req, res) => {
  try {
    const { carModelId, name, side, mode } = req.body;
    if (!carModelId || !name || !side) {
      return res.status(400).json({ message: "carModelId, name and side are required" });
    }

    const carModule = await CarModule.findOne({ where: { carModelId, name } });
    if (!carModule) return res.status(404).json({ message: "Module not found" });

    const where = { carModuleId: carModule.id, side };
     if (mode === "test") {
       where.status = "verified"; 
     }

    const parts = await CarModulePart.findAll({
      where,
      attributes: ["id", "partName", "partNumber", "partValue", "x", "y", "width", "height", "description", "status"],
    });

    res.json(parts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/modules/parts -> approved/verified parts only
exports.getApprovedModuleParts = async (req, res) => {
  try {
    const { carModelId, name, side } = req.query;
    if (!carModelId || !name || !side) {
      return res.status(400).json({ message: "carModelId, name and side are required" });
    }

    const carModule = await CarModule.findOne({ where: { carModelId, name } });
    if (!carModule) return res.status(404).json({ message: "Module not found" });

    const parts = await CarModulePart.findAll({
      where: {
        carModuleId: carModule.id,
        side,
        status: "verified", // exclude pending & rejected
      },
      attributes: ["id", "partName", "partNumber", "partValue", "x", "y", "width", "height", "description", "status"],
    });

    res.json(parts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addModulePart = async (req, res) => {
   try {
     const { carModuleId, side, partName, partNumber, partValue, x, y, width, height, description, addedBy } = req.body;

     if (!carModuleId || !side || !partName || x == null || y == null || width == null || height == null) {
       return res.status(400).json({ message: "carModuleId, side, partName, x, y, width, height are required" });
     }

     const part = await CarModulePart.create({
       carModuleId,
       side,
       partName,
       partNumber,
       partValue,
       x,
       y,
       width,
       height,
       description,
       addedBy,
       status: "pending", 
     });

     res.status(201).json(part);
   } catch (err) {
     res.status(500).json({ message: err.message });
   }
 };

exports.updateModulePart = async (req, res) => {
  try {
    const { id } = req.params;
    const { carModuleId, side, partName, partNumber, partValue, x, y, width, height, description, addedBy } = req.body;

    const part = await CarModulePart.findByPk(id);
    if (!part) {
      return res.status(404).json({ message: "Part not found" });
    }

    await part.update({
      carModuleId: carModuleId !== undefined ? carModuleId : part.carModuleId,
      side: side !== undefined ? side : part.side,
      partName: partName !== undefined ? partName : part.partName,
      partNumber: partNumber !== undefined ? partNumber : part.partNumber,
      partValue: partValue !== undefined ? partValue : part.partValue,
      x: x !== undefined ? x : part.x,
      y: y !== undefined ? y : part.y,
      width: width !== undefined ? width : part.width,
      height: height !== undefined ? height : part.height,
      description: description !== undefined ? description : part.description,
      addedBy: addedBy !== undefined ? addedBy : part.addedBy,
      status: "pending",
    });

    res.status(200).json(part);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 
 
 exports.reviewModulePart = async (req, res) => {
   try {
     const { id } = req.params;
     const { status, reviewedBy } = req.body;

     if (!["verified", "rejected"].includes(status)) {
       return res.status(400).json({ message: "status must be 'verified' or 'rejected'" });
     }

     const part = await CarModulePart.findByPk(id);
     if (!part) return res.status(404).json({ message: "Part not found" });

     part.status = status;
     part.reviewedBy = reviewedBy;
     await part.save();

     res.json(part);
   } catch (err) {
     res.status(500).json({ message: err.message });
   }
 };

 
 exports.getPendingParts = async (req, res) => {
   try {
     const parts = await CarModulePart.findAll({ where: { status: "pending" } });
     res.json(parts);
   } catch (err) {
     res.status(500).json({ message: err.message });
   }
 };