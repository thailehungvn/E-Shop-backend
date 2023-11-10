const { Product, Category, Supplier } = require("../../models/");
const {
  fuzzySearch,
  // combineObjects,
} = require("../../helper");
module.exports = {
  getList: async (req, res, next) => {
    try {
      const{page,pageSize,categoryId}=req.query
      const pages = page || 1
      const limit = pageSize || 10
      const skip= ((pages - 1) * limit)
      const conditionFind={isDeleted:false}
      if(categoryId) conditionFind.categoryId=categoryId
      const result = await Product
     
    //   .updateMany(
    //     { isDeleted:true },
    //     { $set: { "isDeleted" : false } }
    //  );
      .find(conditionFind)
        .populate("category")
        .populate("supplier")
        .populate("image")
        .lean()
        .skip(skip)
        .limit(limit);
      const total=await Product.countDocuments(conditionFind)

      return res.send(200, {
        message: "Thành công",
        payload: result,
        total:total
      });
    } catch (err) {
      return res.send(400, {
        message: "Thất bại",
        error: err,
      });
    }
  },
  search: async (req, res, next) => {
    try {
      const { name, priceEnd, priceStart, discountStart, discountEnd } =
        req.query;
      const conditionFind = { isDeleted: false };

      if (name) conditionFind.name = fuzzySearch(name);
      if (discountStart && discountEnd) {
        const compareStart = { $lte: ["$discount", discountEnd] }; // '$field'
        const compareEnd = { $gte: ["$discount", discountStart] };
        conditionFind.$expr = { $and: [compareStart, compareEnd] };
      } else if (discountStart) {
        conditionFind.discount = { $gte: parseFloat(discountStart) };
      } else if (discountEnd) {
        conditionFind.discount = { $lte: parseFloat(discountEnd) };
      }
      if (priceEnd && priceStart) {
        const compareStart = { $lte: ["$price", priceEnd] }; // '$field'
        const compareEnd = { $gte: ["$price", priceStart] };
        conditionFind.$expr = { $and: [compareStart, compareEnd] };
      } else if (priceStart) {
        conditionFind.price = { $gte: parseFloat(priceStart) };
      } else if (priceEnd) {
        conditionFind.price = { $lte: parseFloat(priceEnd) };
      }
      const result = await Product.find(conditionFind)
      .populate("category")
      .populate("supplier")
      .lean();
      if (result) {
        return res.send(200, {
          mesage: "Thành công",
          payload: result,
        });
      }
      return res.send(404, {
        mesage: "Không tìm thấy",
      });
    } catch (err) {
      return res.send(404, {
        mesage: "Thất bại",
        error: err,
      });
    }
  },
  getDetail: async (req, res, next) => {
    const { id } = req.params;
    try {
      const result = await Product.findOne({ _id: id,isDeleted:false }).populate('category').populate('supplier').populate('image');
      if (result) {
        return res.send(200, {
          message: "Thành công",
          payload: result,
        });
      }
      return res.send(400, {
        message: "Không tìm thấy",
      });
    } catch (err) {
      return res.send(404, {
        message: "Thất bại",
        errorL: err,
      });
    }
  },
  create: async (req, res, next) => {
    const {
      name,
      price,
      discount,
      stock,
      categoryId,
      supplierId,
      description,
      mediaId,
      isDeleted,
    } = req.body;
    try {
      const newRecord = new Product({
        name,
        price,
        discount,
        stock,
        categoryId,
        supplierId,
        description,
        mediaId,
        isDeleted,
      });
      const result = await newRecord.save();
      console.log("◀◀◀ result ▶▶▶", result);
      return res.status(200).json({
        mesage: "Thành công",
        payload: result,
      });
    } catch (err) {
      return res.send(400, {
        mesage: "Thất bại",
        error: err,
      });
    }
  },
  update: async (req, res, next) => {
    const { id } = req.params;
    const {
      name,
      price,
      discount,
      stock,
      categoryId,
      supplierId,
      description,
      mediaId,
      isDeleted,
    } = req.body;
    try {
      const result = await Product.findByIdAndUpdate(
        id,
        {
          name,
          price,
          discount,
          stock,
          categoryId,
          supplierId,
          description,
          mediaId,
          isDeleted,
        },
        { new: true }
      );
      console.log('◀◀◀ a ▶▶▶');
      if(result){
        return res.send ({
          code:200,
          message:"Thành công",
          payload:result
        })
      }
      return res.send ({
        code:400,
        message:"Thất bại",
      })
    } catch (err) {
      return res.send({ code: 400, message: "Thất bại", error: err });
    }
  },
  softDelete: async (req, res, next) => {
    const { id } = req.params;
    try {
      const result =await Product.findByIdAndUpdate(id,{isDeleted:true},{new:true})
      if(result){
        return res.send({
          code:200,
          message:"Thành công xóa" 
        })
      }
      return res.send({
        code:400,
        message:"Thất bại"
      })
    } catch (err) {
      return res.send({
        code:400,
        message:"Thất bại",
        error:err
      })
    }
  },
  // hardDelete: async(req,res,next)=>{
  //   const {id} =req.params;
  //   const newProductList=products.filter((item)=>item.id.toString()!==id.toString())
  //   await writeFileSync(patch,newProductList)
  //   return res.send(200, {
  //       message: "Thành công xóa",
  //     });
  // }
};
