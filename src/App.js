import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [charData, setCharData] = useState([]);
  const [done, setDone] = useState(false);
  const [output, setOutput] = useState("");

  const getAllCharacterData = useCallback(async () => {
    let select1 = document.getElementById("character_1_select");
    let select2 = document.getElementById("character_2_select");
    let final = [];
    for (let i = 1; i <= 9; i++) {
      const data = await axios.get(`https://swapi.dev/api/people/?page=${i}`);
      const characterData = await data.data.results;
      for (const c of characterData) {
        final.push({
          name: c.name,
          planet: c.homeworld,
          starships: c.starships,
          vehicles: c.vehicles,
          films: c.films,
        });

        let option1 = document.createElement("option");
        option1.value = c.name;
        option1.innerHTML = c.name;

        let option2 = document.createElement("option");
        option2.value = c.name;
        option2.innerHTML = c.name;

        select1.appendChild(option1);
        select2.appendChild(option2);
      }
    }
    setCharData(final);
  }, []);

  useEffect(() => {
    getAllCharacterData();
  }, [getAllCharacterData]);

  useEffect(() => {
    let elm = document.getElementById("similarities");
    if (done && elm !== undefined) {
      elm.innerHTML = output;
      elm.animate(
        [
          {
            transform: "perspective(200px) rotateX(20deg) translateY(100vh)",
          },
          {
            transform: "perspective(200px) rotateX(20deg) translateY(0)",
          },
        ],
        {
          duration: 5000,
          easing: "ease",
          fill: "forwards",
        }
      );
      setDone(false);
    }
  }, [done, output]);

  // comparing characters chosen by user
  const compareCharacters = async (e) => {
    e.preventDefault();

    // empty innerHTML at the start
    document.getElementById("similarities").innerHTML = "";

    let finalString = "";

    // get character names from select boxes
    let char1 = document.getElementById("character_1_select");
    let char2 = document.getElementById("character_2_select");

    // get character data from state
    let charData1 = charData.find((char) => char.name === char1.value);
    let charData2 = charData.find((char) => char.name === char2.value);

    // find films in common between characters
    let commonFilms = new Set();
    for (let i = 0; i < charData1.films.length; i++) {
      if (charData2.films.includes(charData1.films[i])) {
        commonFilms.add(charData1.films[i]);
      }
    }

    // COMPARE HOMEWORLDS
    if (charData1.planet === charData2.planet) {
      // get planet data
      const planet = await axios.get(charData1.planet);
      const planetFilms = await planet.data.films;

      let planetString = `${charData1.name} and ${charData2.name} share the same homeworld of ${planet.data.name} in:`;

      for (let i = 0; i < planetFilms.length; i++) {
        if (commonFilms.has(planetFilms[i])) {
          const film = await axios.get(planetFilms[i]);
          planetString = planetString.concat("<br />", film.data.title);
        }
      }

      finalString = finalString.concat(planetString, "<br /><br />");
    }

    // COMPARE STARSHIPS
    let similarStarships = [];
    for (let i = 0; i < charData1.starships.length; i++) {
      if (charData2.starships.includes(charData1.starships[i])) {
        similarStarships.push(charData1.starships[i]);
      }
    }

    for (let i = 0; i < similarStarships.length; i++) {
      const starship = await axios.get(similarStarships[i]);
      const starshipFilms = await starship.data.films;
      let starshipString = `${charData1.name} and ${charData2.name} piloted the same starship, ${starship.data.name}, in:`;

      for (let j = 0; j < starshipFilms.length; j++) {
        if (commonFilms.has(starshipFilms[j])) {
          const film = await axios.get(starshipFilms[j]);
          starshipString = starshipString.concat("<br />", film.data.title);
        }
      }

      finalString = finalString.concat(starshipString, "<br /><br />");
    }

    // COMPARE VEHICLES
    let similarVehicles = [];
    for (let i = 0; i < charData1.vehicles.length; i++) {
      if (charData2.vehicles.includes(charData1.vehicles[i])) {
        similarVehicles.push(charData1.vehicles[i]);
      }
    }

    for (let i = 0; i < similarVehicles.length; i++) {
      const vehicle = await axios.get(similarVehicles[i]);
      const vehicleFilms = await vehicle.data.films;
      let vehicleString = `${charData1.name} and ${charData2.name} used the same vehicle, ${vehicle.data.name}, in:`;

      for (let j = 0; j < vehicleFilms.length; j++) {
        if (commonFilms.has(vehicleFilms[j])) {
          const film = await axios.get(vehicleFilms[j]);
          vehicleString = vehicleString.concat("<br />", film.data.title);
        }
      }

      finalString = finalString.concat(vehicleString, "<br /><br />");
    }

    if (finalString === "") {
      finalString = `*${charData1.name} and ${charData2.name} do not have a homeworld, starship, or vehicle in common :(*`;
    }

    setOutput(finalString);
    setDone(true);
  };

  return (
    <div className="app">
      <img src="/images/star-wars.png" alt="" />
      <h1 className="title">Character Comparison</h1>
      <form className="select_boxes" onSubmit={(e) => compareCharacters(e)}>
        <div>
          <h3>Character 1: </h3>
          <select name="character_1" id="character_1_select"></select>
        </div>
        <button id="button">Compare!</button>
        <div>
          <h3>Character 2: </h3>
          <select name="character_2" id="character_2_select"></select>
        </div>
      </form>
      <p id="similarities"></p>
    </div>
  );
}

export default App;
