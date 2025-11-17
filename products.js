// products.js
// Product database for Yellow Farmhouse Stand

const PRODUCTS = {
    cookies: [
        {
            id: 'cc-cookies-regular',
            name: 'Chocolate Chip Cookies',
            tier: 'Regular',
            image: 'images/cookies-chocolate-chip.jpg',
            description: 'Classic cookies loaded with chocolate chips. Soft and chewy.',
            quantities: [
                { size: '1/2 dozen', price: 12 },
                { size: 'dozen', price: 20 }
            ]
        },
        {
            id: 'pb-cookies-regular',
            name: 'Peanut Butter Cookies',
            tier: 'Regular',
            image: 'images/cookies-peanut-butter.jpg',
            description: 'Rich peanut butter flavor, soft and crumbly. A classic favorite.',
            quantities: [
                { size: '1/2 dozen', price: 12 },
                { size: 'dozen', price: 20 }
            ]
        },
        {
            id: 'sc-cookies-regular',
            name: 'Sugar Cookies',
            tier: 'Regular',
            image: 'images/cookies-sugar.jpg',
            description: 'Sweet, buttery cookies with a soft texture. Perfect for any occasion.',
            quantities: [
                { size: '1/2 dozen', price: 12 },
                { size: 'dozen', price: 20 }
            ]
        },
        {
            id: 'or-cookies-regular',
            name: 'Oatmeal Raisin Cookies',
            tier: 'Regular',
            image: 'images/cookies-oatmeal-raisin.jpg',
            description: 'Hearty oatmeal cookies with plump raisins. Chewy and satisfying.',
            quantities: [
                { size: '1/2 dozen', price: 12 },
                { size: 'dozen', price: 20 }
            ]
        },
        {
            id: 'mf-cookies-fancy',
            name: 'Mint Fudge Cookies',
            tier: 'Fancy',
            image: 'images/cookies-mint-fudge.jpg',
            description: 'Rich mint and fudge combination. Decadent and elegant.',
            quantities: [
                { size: '1/2 dozen', price: 15 },
                { size: 'dozen', price: 26 }
            ]
        },
        {
            id: 'ssc-cookies-fancy',
            name: 'Salted Caramel Swirl Cookies',
            tier: 'Fancy',
            image: 'images/cookies-salted-caramel.jpg',
            description: 'Buttery cookies with sweet and salty caramel swirl.',
            quantities: [
                { size: '1/2 dozen', price: 15 },
                { size: 'dozen', price: 26 }
            ]
        },
        {
            id: 'sb-cookies-fancy',
            name: 'Strawberry Bliss Cookies',
            tier: 'Fancy',
            image: 'images/cookies-strawberry-bliss.jpg',
            description: 'Fresh strawberry filling with white chocolate chunks.',
            quantities: [
                { size: '1/2 dozen', price: 15 },
                { size: 'dozen', price: 26 }
            ]
        },
        {
            id: 'mc-cookies-complex',
            name: 'Matcha Cheesecake Cookies',
            tier: 'Complex',
            image: 'images/cookies-matcha-cheesecake.jpg',
            description: 'Sophisticated matcha with creamy cheesecake center.',
            quantities: [
                { size: '1/2 dozen', price: 18 },
                { size: 'dozen', price: 32 }
            ]
        },
        {
            id: 'lb-cookies-complex',
            name: 'Lavender Blueberry Cookies',
            tier: 'Complex',
            image: 'images/cookies-lavender-blueberry.jpg',
            description: 'Delicate lavender with tart blueberries.',
            quantities: [
                { size: '1/2 dozen', price: 18 },
                { size: 'dozen', price: 32 }
            ]
        },
        {
            id: 'tl-cookies-complex',
            name: 'Triple Layer Cookies',
            tier: 'Complex',
            image: 'images/cookies-triple-layer.jpg',
            description: 'Three distinct layers of flavor and texture.',
            quantities: [
                { size: '1/2 dozen', price: 18 },
                { size: 'dozen', price: 32 }
            ]
        }
    ],
    cakes: [
        {
            id: 'choc-cake',
            name: 'Chocolate Cake',
            price: 30,
            unit: 'cake',
            image: 'images/cake-chocolate.jpg',
            description: 'Rich, moist chocolate cake with creamy frosting.'
        },
        {
            id: 'van-cake',
            name: 'Vanilla Cake',
            price: 30,
            unit: 'cake',
            image: 'images/cake-vanilla.jpg',
            description: 'Classic vanilla cake with a light, fluffy texture.'
        },
        {
            id: 'carrot-cake',
            name: 'Carrot Cake',
            price: 32,
            unit: 'cake',
            image: 'images/cake-carrot.jpg',
            description: 'Moist carrot cake with cream cheese frosting.'
        }
    ],
    pies: [
        {
            id: 'apple-pie',
            name: 'Apple Pie',
            price: 25,
            unit: 'pie',
            image: 'images/pie-apple.jpg',
            description: 'Classic apple pie with a flaky crust and cinnamon apples.'
        },
        {
            id: 'pumpkin-pie',
            name: 'Pumpkin Pie',
            price: 25,
            unit: 'pie',
            image: 'images/pie-pumpkin.jpg',
            description: 'Spiced pumpkin filling in a buttery crust. A holiday favorite.'
        },
        {
            id: 'peach-pie',
            name: 'Peach Pie',
            price: 25,
            unit: 'pie',
            image: 'images/pie-peach.jpg',
            description: 'Sweet peaches baked in a golden crust.'
        }
    ],
    breads: [
        {
            id: 'milk-bread',
            name: 'Milk Bread',
            price: 12,
            unit: 'loaf',
            image: 'images/bread-milk.jpg',
            description: 'Soft, fluffy bread made with fresh milk. Perfect for sandwiches.'
        },
        {
            id: 'pumpkin-bread',
            name: 'Pumpkin Bread',
            price: 12,
            unit: 'loaf',
            image: 'images/bread-pumpkin.jpg',
            description: 'Moist pumpkin bread with warm spices. A fall favorite.'
        }
    ]
};
