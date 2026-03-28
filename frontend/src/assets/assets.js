import burger from './burger.jpeg'
import jollof from './jollof-dodo.jpg'
import shopping from './shopping.png'
import investigation from './investigation.png'
import food from './food.png'
import ogbono from './ogbono-soup.jpg'
import nigeria from './nigerian-fufu.jpg'
import Egusi from './Egusi-Soup.webp'
import f4 from './f4.png'
import f5 from './f5.png'
import f6 from './f6.png'
import f7 from './f7.png'
import rating_starts from './rating_starts.jpg'
import drinks from './drinks.png'
import pepper_soup from './Catfish-peppersoup.JPG'



export const assets = {
    burger,
    jollof,
    shopping,
    investigation,
    rating_starts,
    food,
    ogbono,
    nigeria,
    Egusi,
    f4,
    f5,
    f6,
    f7,
    drinks,
    pepper_soup


}

export const Menulist = [
    {menu_name: "rice" ,
     menu_image: jollof 
    },

    {menu_name: "soup",
     menu_image: ogbono

    },

    {menu_name: "swallow",
     menu_image: nigeria   

    },

    {
        menu_name: "dessert",
        menu_image: f5
    },  

    {   menu_name: "snacks" ,
        menu_image: burger
    },

    {   menu_name: "drinks",
        menu_image:   drinks

    },

    {   menu_name: "pepper-soup",
        menu_image: pepper_soup   

    }

    

    


]


  export const Food_List = [
     { _id: "1",
     name: "Jollof Rice",
     image: jollof,
     price: 20,
     description :"our food provided the best nutrient that nourishes your body",
     category: "rice"
    },

    {  _id: "2",
       name: "Ogbono Soup",
       image:   ogbono,
       price: 20,
       description :"our food provided the best nutrient that nourishes your body",
       category: "soup"

    },

    {  _id: "3",
        name: "FuFu with Egusi",
        image: nigeria,
        price: 20,
        description :"our food provided the best nutrient that nourishes your body",
        category: "swallow"   

    },

    {   _id: "4",
        name: "Egusi Soup",
        image: Egusi,
        price: 20,
        description :"our food provided the best nutrient that nourishes your body",
        category: "soup"
    },  

    {   _id: "4",
        name: "Jollof Rice",
        image: f4,
        price: 20,
        description :"our food provided the best nutrient that nourishes your body",
        category: "rice" 
    },

    {   _id: "5",
        name: "Ogbono Soup",
        image:   f5,
        price: 20,
        description :"our food provided the best nutrient that nourishes your body",
        category: "soup"

    },

    {   _id: "6",
        name: "FuFu with Egusi",
        image: f6,
        price: 20,
        description :"our food provided the best nutrient that nourishes your body",
         category: "swallow"  

    },

    {   _id: "7",
        name: "Egusi Soup",
        image: f7,
        price: 20,
        description :"our food provided the best nutrient that nourishes your body",
        category: "soup"
    }

    


]