
var express = require('express');
var router = express.Router();

//Thêm model 
const Distributors = require('../models/distributors')
const Fruits = require('../models/fruits')
const Users = require('../models/users')
const Categorys = require('../models/category')
const Favourites = require('../models/favourite');
const Orders = require('../models/orders');
const Reviews = require('../models/review');
const Carts = require('../models/cart');
//Thêm common
const Upload = require('../config/common/upload')
const Transporter = require('../config/common/mail')


//API Cập nhật trong cart
router.put('/update-cart', async (req, res) => {
    try {
        const { id_user, id_fruit, quantity } = req.body;

        // Kiểm tra xem id_user và id_fruit có tồn tại không
        if (!id_user || !id_fruit) {
            return res.status(400).json({
                status: 400,
                message: "Thiếu thông tin id_user hoặc id_fruit"
            });
        }

        // Kiểm tra xem quantity có tồn tại không
        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                status: 400,
                message: "Số lượng không hợp lệ"
            });
        }

        // Tìm giỏ hàng hiện tại trong cơ sở dữ liệu
        const currentCart = await Carts.findOne({ id_user: id_user, id_fruit: id_fruit });

        // Kiểm tra xem giỏ hàng có tồn tại không
        if (!currentCart) {
            return res.status(404).json({
                status: 404,
                message: "Không tìm thấy giỏ hàng"
            });
        }

        // Kiểm tra xem quantity đã thay đổi so với giá trị ban đầu chưa
        if (currentCart.quantity === quantity) {
            return res.status(200).json({
                status: 200,
                message: "Số lượng giỏ hàng không thay đổi",
                data:null
            });
        }

        // Nếu quantity đã thay đổi, tiến hành cập nhật
        const updatedCart = await Carts.findOneAndUpdate(
            { id_user: id_user, id_fruit: id_fruit },
            { quantity: quantity },
            { new: true }
        );

        // Trả về thông báo thành công và dữ liệu giỏ hàng đã cập nhật
        return res.status(200).json({
            status: 200,
            message: "Cập nhật giỏ hàng thành công",
            data:null
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 500,
            message: "Đã xảy ra lỗi trong quá trình cập nhật giỏ hàng"
        });
    }
});
//API xóa fruit trong cart
router.delete('/delete-cart',async(req,res) =>{
    try {
        const { id_user, id_fruit} = req.query;
        const result = await Carts.findOneAndDelete({id_user:id_user,id_fruit:id_fruit});
        if(result){
            res.json({
                "status":200,
                "messenger":"Xóa thành công",
                "data":null,
            })
        }else{
            res.json({
                "status":400,
                "messenger":"Xóa không thành công",
                "data":null,
            })
        }
    } catch (error) {
        console.log(error);
    }
})
//API thêm fruit vào cart
router.post('/add-cart', async (req, res) => {
    try {
        const { id_user, id_fruit} = req.body;
        
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingCartItem = await Carts.findOne({ id_user: id_user, id_fruit: id_fruit });

        if (existingCartItem) {
            // Nếu sản phẩm đã tồn tại trong giỏ hàng, trả về thông báo lỗi
            res.json({
                "status": 400,
                "messenger": "Sản phẩm đã tồn tại trong giỏ hàng",
                "data":null // Đảm bảo rằng dữ liệu trả về là một mảng JSON để tránh lỗi
            });
        } else {
            // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm sản phẩm vào giỏ hàng
            const { id_user,id_fruit,quantity} = req.body;
            const newCart = new Carts({
                id_user: id_user,
                id_fruit: id_fruit,
                quantity: quantity,
            });

            const result = await newCart.save();
            if (result) {
                res.json({
                    status: 200,
                    messenger: "Thêm thành công",
                    data:null // Đảm bảo rằng dữ liệu trả về là một mảng JSON để tránh lỗi
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, messenger: "Đã xảy ra lỗi", data: [] }); // Đảm bảo rằng dữ liệu trả về là một mảng JSON để tránh lỗi
    }
});

//API get cart theo id_user
router.get('/get-cart/:id_user', async (req, res) => {
    try {
        const { id_user } = req.params;
        const data = await Carts.find({ id_user }).populate('id_user').populate({
            path: 'id_fruit',
            select: '_id name quantity price image'
        });

        if (data) {
            res.json({
                status: 200,
                message: 'Lấy thông tin cart thành công',
                data: data
            });
        } else {
            res.json({
                status: 400,
                message: 'Lỗi, không có thông tin cart',
                data: []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

//API get user theo id
router.get('/get-user/:id_user', async(req,res)=>{
    const {id_user} = req.params;
    const data = await Users.findById(id_user);

    if(data){
        res.json({
            "status":200,
            "messenger":"Lấy thông tin user thành công",
            "data":data
        })
    }else{
        res.json({
            "status":400,
            "messenger":"Lỗi, Lấy thông tin user thất bại",
            "data":[]
        })
    }

});
//API thêm reviews
router.post('/add-reviews', async(req,res)=>{
    try {
        const {id_fruit,id_user,rating,comment} = req.body;

        const newReview = new Reviews({
            id_fruit: id_fruit,
            id_user: id_user,
            rating: rating,
            comment: comment,
        })
        const result = await newReview.save();//Thêm vào database
        if(result){
            res.json({
                "status":200,
                "messenger":"Thêm thành công",
                "data":result
            })
        }else{
            res.json({
                "status":400,
                "messenger":"Lỗi,Thêm không thành công",
                "data":null
            })
        }
    } catch (error) {
        console.log(error)
    }
})

//Get về số sao và số đánh giá
router.get('/get-reviews/:id_fruit', async (req, res) => {
    try {
        const {id_fruit} = req.params;

        // Query reviews for the product_id
        const reviews = await Reviews.find({id_fruit});

        // Calculate average rating
        let totalRating = 0;
        for (const review of reviews) {
            totalRating += review.rating;
        }
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0; // Tránh chia cho 0

        res.json({ 
            "status": 200,
            "messenger": "Lấy dữ liệu thành công",
            data: {
                averageRating,
                numberOfReviews: reviews.length
            }}); // Trả về cả số người đánh giá
    } catch (error) {
        console.error('Error fetching average rating:', error);
        res.status(500).json({ error: 'An error occurred while fetching average rating' });
    }
});

//API thêm order
router.post('/add-order', async(req,res)=>{
    try {
        const data = req.body;
        const newOrder = new Orders({
            order_code: data.order_code,
            id_user:data.id_user
        })
        const result = await newOrder.save();//Thêm vào database
        if(result){
            res.json({
                "status":200,
                "messenger":"Thêm thành công",
                "data":result
            })
        }else{
            res.json({
                "status":400,
                "messenger":"Lỗi,Thêm không thành công",
                "data":null
            })
        }
    } catch (error) {
        console.log(error)
    }
})
//API theo tên sản phẩm get Favourite
router.get('/get-favourite/:id_user', async (req, res) => {
    try {
        const userId = req.params.id_user;
        const { searchTerm } = req.query;

        // Xây dựng câu truy vấn dựa trên searchTerm
        const query = searchTerm ? { name: { $regex: searchTerm, $options: "i" } } : {};

        const result = await Favourites.find({ id_user: userId })
            .populate({
                path: 'id_fruit',
                match: query, // Sử dụng câu truy vấn để lọc kết quả
                select: '_id name quantity price image'
            });
        const data = result.filter(favourite => favourite.id_fruit !== null);
        if (data) {
            res.json({
                "status": 200,
                "message": "Get Favourite thành công",
                "data": data
            });
        } else {
            res.json({
                "status": 400,
                "message": "Không tìm thấy sản phẩm yêu thích",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": 500,
            "message": "Có lỗi xảy ra khi lấy dữ liệu yêu thích",
            "data": []
        });
    }
});
//API get favourite theo id người dùng
router.get('/get-favourite/:id_user',async (req,res)=>{
    try {
        const userId = req.params.id_user;
        const result = await Favourites.find({id_user: userId}).populate({
            path: 'id_fruit',
            select: '_id name quantity price image'
        });
        if(result){
            res.json({
                "status": 200,
                "message": "Get Favourite thành công",
                "data": result
            });
        }else{
            res.json({
                "status": 400,
                "message": "Không tìm thấy sản phẩm yêu thích",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
    }
});


// API xóa favourite
router.delete('/remove-favourite/:id_user/:id_fruit', async (req, res) => {
    try {
        const userId = req.params.id_user;
        const favouriteId = req.params.id_fruit;
        // Tìm và xóa sản phẩm yêu thích dựa trên id của người dùng và id của sản phẩm yêu thích
        const result = await Favourites.findOneAndDelete({ id_user: userId, id_fruit: favouriteId });
        if (result) {
            res.json({
                "status": 200,
                "message": "Xóa favourite thành công",
                "data":null
            });
        } else {
            res.json({
                "status": 400,
                "message": "Không tìm thấy sản phẩm yêu thích để xóa",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
    }
});
//Api thêm favourite
router.post('/user-products', async (req, res) => {
    try {
        // Lấy dữ liệu từ yêu cầu
        const { id_user, id_fruit} = req.body;

        // Kiểm tra xem đã tồn tại cặp id_user và id_fruit trong danh sách yêu thích chưa
        const existingProduct = await Favourites.findOne({ id_user: id_user, id_fruit: id_fruit });

        // Nếu đã tồn tại, trả về thông báo rằng mục đã tồn tại và không thêm mới
        if (existingProduct) {
            return res.json({
                "status": 400,
                "message": "Mục đã tồn tại trong danh sách yêu thích",
                "data":null
            });
        }

        // Nếu không tồn tại, tạo một đối tượng UserProduct mới và lưu vào cơ sở dữ liệu
        const userProduct = new Favourites({
            id_user: id_user,
            id_fruit: id_fruit,
        });
        const result = await userProduct.save();

        // Trả về phản hồi thành công
        res.json({
            "status": 200,
            "message": "Thêm danh sách yêu thích thành công",
            "data":null
        });
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error(error);
    }
});

//JWT
const JWT = require('jsonwebtoken')
const SECRETKEY = "FPTPOLYTECHNIC"

router.post('/login', async (req,res)=>{
    try {
        const {username,password} = req.body;
        const user = await Users.findOne({username,password})

        if(user){
            //Token nguời dùng sẽ sử dụng gửi lên trên header mỗi lần muốn gọi api
            const token = JWT.sign({id:user._id}, SECRETKEY,{expiresIn:'1h'});

            const  refreshToken = JWT.sign({id:user._id}, SECRETKEY,{expiresIn:'1d'});

            res.json({
                "status":200,
                "messenger":"Dang nhap thanh cong",
                "data":user,
                "token":token,
                "refreshToken":refreshToken
            })
        }else{
            res.json({
                "status":200,
                "messenger":"Loi, dang nhap khong thanh cong",
                "data":[]
            })
        }
    } catch (error) {
        console.log(error)
        
    }
})
//Api thêm distributor
router.post('/add-distributor',async (req,res) =>{
    try {
        const data = req.body; //Lấy dữ liệu từ body
        const newDistributors = new Distributors({
            name: data.name
        });// Tạo một đối tượng mới
        const result = await newDistributors.save();// THêm vào database
        if(result){
            //Nếu thêm thành công result !null trả về dữ liệu
            res.json({
                "status":200,
                "messenger":"Thêm thành công",
                "data":result
            })
        }else{
            //Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status":400,
                "messenger":"Lỗi, thêm không thành công",
                "data":[]
            })
        }

    } catch (error) {
        console.log(error)
    }
});


//Api getlist category
router.get('/get-list-category',async (req,res)=>{
    try {
        const data = await Categorys.find();
        if(data){
            //Nếu get thành công result !null trả về dữ liệu
            res.json({
                "status":200,
                "messenger":"Thêm thành công",
                "data":data
            })
        }else{
            //Nếu get không thành công result null, thông báo không thành công
            res.json({
                "status":400,
                "messenger":"Lỗi, thêm không thành công",
                "data":[]
            })
        } 
    } catch (error) {
        console.log(error) 
    }

})
//Api sản phẩm theo mã loai
router.get('/get-list-fruits/:id_category', async (req, res) => {
    try {
        const {id_category} = req.params //Lấy dữ liệu thông qua: id trên url gọi là param
        const data = await Fruits.find({id_category:id_category}).populate('id_distributor').populate('id_category');
        if (data) {
            // Nếu tìm thấy trái cây có category là categoryCode, trả về dữ liệu
            res.json({
                "status": 200,
                "messenger": `Danh sách trái cây có category`,
                "data": data
            });
        } else {
            // Nếu không tìm thấy trái cây có category là categoryCode, trả về thông báo không có dữ liệu
            res.json({
                "status": 400,
                "messenger": `Không tìm thấy trái cây có category`,
                "data": []
            });
        }
    } catch (error) {
        // Xử lý lỗi nếu có
        console.log(error);
    }
});
//Api thêm Fruits
router.post('/add-fruit',async (req,res)=>{
    try {
        const data = req.body; //Lấy dữ liệu từ body
        const newFruit = new Fruits({
            name: data.name,
            quantity: data.quantity,
            price: data.price,
            status:data.status,
            image: data.image,
            description: data.description,
            id_distributor: data.id_distributor
        }); // Tạo một đối tượng mới
        const result = await newFruit.save()//Thêm vào database
        if(result){
            //Nếu thêm thành công result !null trả về dữ liệu
            res.json({
                "status":200,
                "messenger":"Thêm thành công",
                "data":result
            })
        }else{
            //Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status":400,
                "messenger":"Lỗi, thêm không thành công",
                "data":[]
            })
        }
    } catch (error) {
        console.log(error)
    }
});
//Api get danh sách fruits
router.get('/get-list-fruit',async (req, res, next) =>{
    const authHeader = req.headers['authorization']
    //Authorization them tu khoa `Bearer token`
    //Nen se xu li cat chuoi
    const token = authHeader && authHeader.split(' ')[1]
    //Neu khong co token sex tra ve 401
    if(token ===null){
        return res.sendStatus(401);
    }
    let payload;
    JWT.verify(token,SECRETKEY, (err,_payload) =>{
        //Kiem tra token, neu token khong dung hoac het han
        //Tra status code 403
        //Tra status code 401 khi token het han
        if(err instanceof JWT.TokenExpiredError) return res.sendStatus(401)
        if(err) return res.sendStatus(403)
        //Neu dung se log ra du lieu
        payload = _payload;
    })
    console.log(payload)
    try {
        const data = await Fruits.find().populate('id_distributor').populate('id_category');
        res.json({
            "status":200,
            "messenger":"Danh sách fruit",
            "data":data
        })
        
    } catch (error) {
        console.log(error)
    }
});
//Api get chi tiết fruits(truyền param id)
router.get('/get-fruit-by-id/:id', async (req, res) =>{
    //:id param 
    try {
        const {id} = req.params //Lấy dữ liệu thông qua: id trên url gọi là param
        const data = await Fruits.findById(id).populate('id_distributor');
        res.json({
            "status":200,
            "messenger":"Danh sách fruits",
            "data":data
        })
        
    } catch (error) {
        console.log(error)
        
    }
});

// Api get danh sách fruit(danh sách trả về gồm:name, quantity, price, id_distributor) nằm trong khoảng giá
// (query giá cao nhất, giá thấp nhất) và sắp xếp theo quantity(giảm dần)
router.get('/get-list-fruit-in-price', async (req,res)=>{
    //:id param

    try {
        const {price_start,price_end} = req.query

        const query = {price:{$gte: price_start,$lte:price_end}}

        const data = await Fruits.find(query,'name quantity price id_distributor' )
                                    .populate('id_distributor')
                                    .sort({quantity: -1})
                                    .skip(0)
                                    .limit(2)
        res.json({
            "status":200,
            "messenger":"Danh sách fruit",
            "data":data
        })
        
    } catch (error) {
        console.log(error)
        
    }
});
//TÌm kiếm sản phẩm theo giá nhập
router.get('/get-list-fruit-in-prices', async (req, res) => {
    try {
        let query;
        const { price_start, price_end } = req.query;

        if (price_start && price_end) {
            query = { price: { $gte: price_start, $lte: price_end } };
        } else if (price_start) {
            query = { price: { $gte: price_start } };
        }
        const data = await Fruits.find(query, 'name quantity price status image description id_distributor id_category')
            .populate('id_distributor')
            .populate('id_category')
            .sort({ quantity: -1 })
            .skip(0);
            // .limit(2);

        res.json({
            "status": 200,
            "messenger": "Danh sách fruit",
            "data": data
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ "status": 500, "message": "Internal server error" });
    }
});

router.get('/get-list-fruit-have-name', async (req, res) => {
    try {
        const {searchTerm} = req.query; // Nhận tham số tìm kiếm từ yêu cầu

        // Tạo điều kiện tìm kiếm dựa trên tham số tìm kiếm
        const query = { name: { $regex: searchTerm, $options: "i" } };

        // Tìm kiếm các tài liệu trong cơ sở dữ liệu phù hợp với điều kiện và chọn các trường dữ liệu mong muốn
        const data = await Fruits.find(query, 'name quantity price status image description id_distributor id_category')
                                  .sort({ createdAt: -1 })
                                    .populate('id_distributor').populate('id_category');

        if(data){
                res.json({
                    "status": 200,
                    "messenger": "Danh sách tìm kiếm fruits theo tên",
                    "data": data
            })
        }else{
            res.json({
                "status": 400,
                    "messenger": "Không tìm thấy tên trong danh sách",
                    "data":[]
            });
        }
    } catch (error) {
        console.log(error);
    }
});

//Api cập nhật fruits
router.put('/update-fruit-by-id/:id', async (req,res) =>{
    try {
        const {id} = req.params
        const data = req.body
        const updateFruit = await Fruits.findById(id)
        let result = null;
        if(updateFruit){
            updateFruit.name = data.name ?? updateFruit.name;
            updateFruit.quantity = data.quantity ?? updateFruit.quantity;
            updateFruit.price = data.price ?? updateFruit.price;
            updateFruit.status = data.status ?? updateFruit.status;
            updateFruit.image = data.image ?? updateFruit.image;
            updateFruit.description = data.description ?? updateFruit.description;
            updateFruit.id_distributor = data.id_distributor ?? updateFruit.id_distributor;

            result = await updateFruit.save();
        }
        //Tạo một đối tượng mới
        //Thêm vào database
        if(result){
            //Nếu thêm result !null thành công thì trả về dữ liệu
            res.json({
                "status":200,
                "messenger":"Cập nhật thành công",
                "data":result
            })
        }else{
            //Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status":400,
                "messenger":"Lỗi, Cập nhật không thành công",
                "data": []
            })
        }
    } catch (error) {
        console.log(error)
    }
});

//Api xóa fruits
router.delete('/destroy-fruit-by-id/:id', async (req,res) =>{
        try {
            const {id} = req.params
            const result = await Fruits.findByIdAndDelete(id);
            if(result)
            {
                //Nếu xóa thành công sẽ trả về thông tin item đã xóa
                res.json({
                    "status":200,
                    "messenger":"Xóa thành công",
                    "data":result
                })
            }else{
                res.json({
                    "status":400,
                    "messenger":"Lỗi, Xóa không thành công",
                    "data":[]
                })
            }
        } catch (error) {
            console.log(error);
        }
});

//Api uploads nhiều ảnh
router.post('/add-fruit-with-file-image',Upload.array('image',3), async (req,res)=>{
    try {
        const data = req.body
        const {files} = req

        const urlsImage = files.map((file) =>`${req.protocol}://${req.get("host")}/uploads/${file.filename}`)

        const newFruit = new Fruits({
            name: data.name,
            quantity: data.quantity,
            price: data.price,
            status: data.status,
            image: urlsImage,
            description: data.description,
            id_distributor:data.id_distributor,
            id_category:data.id_category
        });

        const result = (await newFruit.save()).populate("id_distributor");
        if(result){
            //Nếu thêm thành công result !null trả về dữ liệu
            res.json({
                "status":200,
                "messenger":"Thêm thành công",
                "data":result
            })
        }else{
            //Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status":400,
                "messenger":"Lỗi, thêm không thành công",
                "data":[]
            })
        }
        
    } catch (error) {
        console.log(error)
    }
});

//API gửi mail đăng ký tài khoản thành công
router.post('/register-send-email',Upload.single('avatar'), async(req,res)=>{
    try {
        const data = req.body;
        const file = req
        const newUser = new Users({
            username: data.username,
            password: data.password,
            email: data.email,
            name:data.name,
            avatar: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        })
        const result = await newUser.save()
        if(result){
            //Gửi email
            const mailOptions ={
                from:"langquen5102004@gmail.com", //email gửi đi
                to: result.email,
                subject:"Đăng ký thành công",//subject
                text:"Cảm ơn bạn đã đăng ký",// nội dung email
            };

            await Transporter.sendMail(mailOptions); // gửi emai

            res.json({
                "status":200,
                "messenger":"Thêm thành công",
                "data":result
            })
        }else{
            //Nếu không thành công, thông báo không thành công
            res.json({
                "status":400,
                "messenger":"Lỗi, thêm không thành công",
                "data":[]
            })
        }
    } catch (error) {
        console.log(error)
    }
});
//Api thêm category
router.post('/add-category',async (req,res) =>{
    try {
        const data = req.body; //Lấy dữ liệu từ body
        const newCategory = new Categorys({
            name: data.name
        });// Tạo một đối tượng mới
        const result = await newCategory.save();// THêm vào database
        if(result){
            //Nếu thêm thành công result !null trả về dữ liệu
            res.json({
                "status":200,
                "messenger":"Thêm thành công",
                "data":result
            })
        }else{
            //Nếu thêm không thành công result null, thông báo không thành công
            res.json({
                "status":400,
                "messenger":"Lỗi, thêm không thành công",
                "data":[]
            })
        }

    } catch (error) {
        console.log(error)
    }
});



//Lab5 
router.get('/get-list-distributor', async(req,res) =>{
    try {
        const data = await Distributors.find().sort({createdAt:-1});
        if(data){
            res.json({
                "status":200,
                "messenger":"Thành công",
                "data":data
            })
        }else{
            res.json({
                "status":400,
                "messenger":"Lỗi, không thành công",
                "data":[]
            })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get('/search-distributor',async(req,res)=>{
    try {
        const key = req.query.key;
        const data = await Distributors.find({name:{"$regex":key,"$options":"i"}}).sort({createdAt:-1})
        if(data){
            res.json({
                "status":200,
                "messenger":"Thành công",
                "data":data
            })
        }else{
            res.json({
                "status":400,
                "messenger":"Lỗi, không thành công",
                "data":[]
            })
        }
        
    } catch (error) {
        console.log(error)
        
    }
})
router.delete('/delete-distributor-by-id/:id', async(req,res)=>{
    try {
        const {id} = req.params;
        const result = await Distributors.findByIdAndDelete(id);
        if(result){
            res.json({
                "status":200,
                "messenger":"Xóa thành công",
                "data":result
            })
        }else{
            res.json({
                "status":400,
                "messenger":"Lỗi, xóa không thành công",
                "data":[]
            })
        }
        
    } catch (error) {
        console.log(error)
    }
})
router.put('/put-distributor-by-id/:id', async(req,res)=>{
    try {
        const {id} = req.params;
        const data = req.body;
        const result = await Distributors.findByIdAndUpdate(id,{name:data.name});
        if(result){
            res.json({
                "status":200,
                "messenger":"Cập nhật thành công",
                "data":result
            })
        }else{
            res.json({
                "status":400,
                "messenger":"Lỗi, cập nhật không thành công",
                "data":[]
            })
        }
        
    } catch (error) {
        console.log(error)
    }
})

//Lab7 
router.get('/get-page-fruit', async(req,res) =>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token==null) return res.sendStatus(401)
    let payload;
    JWT.verify(token, SECRETKEY,(err,_payload)=>{
        if(err instanceof JWT.TokenExpiredError) return res.sendStatus(401)
        if(err) return res.sendStatus(403)
        payload = _payload;
    })
    let perPage = 5;
    let page = req.query.page||1 //Page truyền lên
    let skip = (perPage*page)-perPage;
    let count = await Fruits.find().count();
    //bai2lab7
    const name = {"$regex":req.query.name ?? "", "$options":"i"}

    const price = {$gte: req.query.price ?? 0}

    const sort = {price:parseInt(req.query.sort ?? 1)}
    try {
        const data = await Fruits.find({name:name, price:price})
                                    .populate("id_distributor")
                                    .sort(sort)
                                    .skip(skip)
                                    .limit(perPage);
        res.json({
            "status":200,
            "messenger":"Danh sách Fruits",
            "data":{
                "data":data,
                "currentPage":Number(page),
                "totalPage":Math.ceil(count/perPage)
            }
        })                           
    } catch (error) {
        console.log(error)
    }
});

//Cập nhật user
router.post('/update-user/:userId', Upload.single('avatar'), async (req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;
        const file = req.file;

        const updateData = {
            username: data.username ?? undefined, // Giữ nguyên nếu không có dữ liệu mới
            password: data.password ?? undefined,
            email: data.email ?? undefined,
            name: data.name ?? undefined,
        };

        if (file) {
            updateData.avatar = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
        }

        const result = await Users.findByIdAndUpdate(userId, updateData, { new: true });

        if (result) {
            res.json({
                "status": 200,
                "message": "Cập nhật thành công",
                "data": result
            });
        } else {
            res.status(400).json({
                "status": 400,
                "message": "Lỗi, không thể cập nhật người dùng",
                "data": []
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "status": 500,
            "message": "Lỗi server",
            "data": []
        });
    }
});
router.post('/login-with-google', async (req, res) => {
    try {
        const {picture ,email, name} = req.query

        // Kiểm tra xem người dùng có tồn tại trong database hay không
        let user = await Users.findOne({ email });
        let token, refreshToken;

        // Nếu người dùng không tồn tại, tạo tài khoản mới
        if (!user) {
            // Tạo tài khoản người dùng mới với thông tin từ req.body
            const randomPassword = Math.random().toString(36).substring(7);
            const randomUsername = Math.random().toString(36).substring(7);
            user = new Users({
                email: email,
                password: randomPassword,
                username: randomUsername,
                name: name,
                avatar: picture,
            });
            const data = await user.save();
            token = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1h' });
            refreshToken = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1d' });
            return res.status(200).json({
                status: 200,
                messenger: "Đăng nhập thành công người mới",
                data: data,
                token: token,
                refreshToken: refreshToken
            });
        }

        // Tạo token và refresh token cho người dùng đã tồn tại
        token = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1h' });
        refreshToken = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: '1d' });

        // Trả về kết quả cho client
        return res.status(200).json({
            status: 200,
            messenger: "Đăng nhập thành công",
            data: user,
            token: token,
            refreshToken: refreshToken
        });
    } catch (error) {
        console.error('Error while login with Google:', error);
        return res.status(400).json({
            status: 400,
            messenger: "Lỗi, đăng nhập không thành công",
            data: []
        });
    }
});
module.exports = router;