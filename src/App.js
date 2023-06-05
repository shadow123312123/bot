import {useState, useEffect, useCallback} from "react";
import "./App.css";
import Card from "./Components/Card/Card";
import Cart from "./Components/Cart/Cart";
const { getData } = require("./db/db");
const foods = getData();
const tg = window.Telegram.WebApp;

const getTotalPrice = (items = []) => {
  return items.reduce((acc, item) => {
    return acc += item.price * item.quantity
  }, 0)
};

function App() {
  const [cartItems, setCartItems] = useState([]);
  useEffect(() => {
    tg.ready();
  });

  const onSendData = useCallback(() => {
    const data = {
      products: cartItems,
      totalPrice: getTotalPrice(cartItems),
      queryId: tg.initDataUnsafe?.query_id,
    };

    fetch('http://localhost:8000/web-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })
  }, [cartItems])

  useEffect(() => {
    tg.onEvent('mainButtonClicked', onSendData)
    return () => {
      tg.offEvent('mainButtonClicked', onSendData)
    }
  }, [onSendData])

  const onAdd = (food) => {
    const exist = cartItems.find((x) => x.id === food.id);
    if (exist) {
      setCartItems(
        cartItems.map((x) =>
          x.id === food.id ? { ...exist, quantity: exist.quantity + 1 } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...food, quantity: 1 }]);
    }
  };

  const onRemove = (food) => {
    const exist = cartItems.find((x) => x.id === food.id);
    if (exist.quantity === 1) {
      setCartItems(cartItems.filter((x) => x.id !== food.id));
    } else {
      setCartItems(
        cartItems.map((x) =>
          x.id === food.id ? { ...exist, quantity: exist.quantity - 1 } : x
        )
      );
    }
  };

  const onCheckout = () => {
    tg.MainButton.text = "Отправить заказ";
    tg.MainButton.show();
  };

  return (
    <>
      <h1 className="heading">Barbarus Brewery</h1>
      <h1 className="heading">Norilsk</h1>
      <Cart cartItems={cartItems} onCheckout={onCheckout}/>
      <div className="cards__container">
        {foods.map((food) => {
          return (
            <Card food={food} key={food.id} onAdd={onAdd} onRemove={onRemove} />
          );
        })}
      </div>
    </>
  );
}

export default App;
