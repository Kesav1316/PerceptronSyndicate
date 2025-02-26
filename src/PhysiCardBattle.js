import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./PhysiCardBattle.css";

const cards = [
  { id: 1, name: "Gravity Warrior", power: 8, effect: "Reduces opponent's speed by 2" },
  { id: 2, name: "Magneto Master", power: 7, effect: "Increases attack by 3 when played" },
  { id: 3, name: "Thermo Titan", power: 6, effect: "Burns opponent’s shield" },
  { id: 4, name: "Quantum Sorcerer", power: 9, effect: "Random quantum effect applied" }
];

const PhysiCardBattle = () => {
  const [playerCard, setPlayerCard] = useState(null);
  const [opponentCard, setOpponentCard] = useState(null);
  const [result, setResult] = useState("");

  const playCard = (card) => {
    const opponent = cards[Math.floor(Math.random() * cards.length)];
    setPlayerCard(card);
    setOpponentCard(opponent);
    
    if (card.power > opponent.power) {
      setResult("You Win! 🎉");
    } else if (card.power < opponent.power) {
      setResult("You Lose! 😞");
    } else {
      setResult("It's a Draw! 🤝");
    }
  };

  return (
    <div className="physi-card-container">
      <h1>⚡ Physi-Card Battle ⚡</h1>
      <p>Select a card to play against the opponent!</p>
      
      <div className="card-grid">
        {cards.map((card) => (
          <div key={card.id} className="card" onClick={() => playCard(card)}>
            <h3>{card.name}</h3>
            <p>Power: {card.power}</p>
            <p>Effect: {card.effect}</p>
          </div>
        ))}
      </div>
      
      {playerCard && (
        <div className="battle-result">
          <h2>Your Card: {playerCard.name} ({playerCard.power})</h2>
          <h2>Opponent's Card: {opponentCard.name} ({opponentCard.power})</h2>
          <h2 className="result-text">{result}</h2>
        </div>
      )}
      
      <Link to="/" className="back-button">🏠 Back to Home</Link>
    </div>
  );
};

export default PhysiCardBattle;
