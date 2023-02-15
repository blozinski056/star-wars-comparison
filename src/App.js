import React, { Fragment, useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { nanoid } from "nanoid";

function App() {
  const [charData, setCharData] = useState([]);
  const [output, setOutput] = useState([]);
  const [done, setDone] = useState(false);
  const [stillLoading, setStillLoading] = useState(true);
  const [options1, setOptions1] = useState([]);
  const [options2, setOptions2] = useState([]);

  const options1Elms = options1.map((opt) => {
    return (
      <option value={opt} key={nanoid()}>
        {opt}
      </option>
    );
  });

  const options2Elms = options2.map((opt) => {
    return (
      <option value={opt} key={nanoid()}>
        {opt}
      </option>
    );
  });

  const finalOutput = output.map((s) => {
    return <Fragment key={nanoid()}>{s === null ? <br /> : s}</Fragment>;
  });

  const getAllCharacterData = useCallback(async () => {
    let final = [];
    let options1Temp = [];
    let options2Temp = [];
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

        options1Temp.push(c.name);
        options2Temp.push(c.name);
      }
    }
    setStillLoading(false);
    // set values for objects and options
    setCharData(final);
    setOptions1(options1Temp);
    setOptions2(options2Temp);
  }, []);

  useEffect(() => {
    getAllCharacterData();
  }, [getAllCharacterData]);

  useEffect(() => {
    let elm = document.getElementById("similarities");
    if (elm !== undefined) {
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
      document.getElementById("button").innerHTML = "Compare!";
      setDone(false);
    }
  }, [done, output]);

  // comparing characters chosen by user
  const compareCharacters = async (e) => {
    e.preventDefault();

    document.getElementById("button").innerHTML = "Gathering Intel...";
    document.getElementById("button").animate(
      [
        {
          opacity: 0,
        },
        {
          opacity: 1,
        },
      ],
      {
        duration: 1000,
      }
    );

    let finalString = [];

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

      let planetString = [
        `${charData1.name} and ${charData2.name} share the same homeworld of ${planet.data.name} in:`,
      ];

      for (let i = 0; i < planetFilms.length; i++) {
        if (commonFilms.has(planetFilms[i])) {
          const film = await axios.get(planetFilms[i]);
          planetString.push(null);
          planetString.push(film.data.title);
        }
      }

      finalString.push(...planetString);
      finalString.push(null);
      finalString.push(null);
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
      let starshipString = [
        `${charData1.name} and ${charData2.name} piloted the same starship, ${starship.data.name}, in:`,
      ];

      for (let j = 0; j < starshipFilms.length; j++) {
        if (commonFilms.has(starshipFilms[j])) {
          const film = await axios.get(starshipFilms[j]);
          starshipString.push(null);
          starshipString.push(film.data.title);
        }
      }

      finalString.push(...starshipString);
      finalString.push(null);
      finalString.push(null);
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
      let vehicleString = [
        `${charData1.name} and ${charData2.name} used the same vehicle, ${vehicle.data.name}, in:`,
      ];

      for (let j = 0; j < vehicleFilms.length; j++) {
        if (commonFilms.has(vehicleFilms[j])) {
          const film = await axios.get(vehicleFilms[j]);
          vehicleString.push(null);
          vehicleString.push(film.data.title);
        }
      }

      finalString.push(...vehicleString);
      finalString.push(null);
      finalString.push(null);
    }

    if (finalString.length === 0) {
      finalString.push(
        `*${charData1.name} and ${charData2.name} do not have a homeworld, starship, or vehicle in common :(*`
      );
    }

    setOutput(finalString);
    setDone(true);
  };

  return (
    <div className="app">
      {stillLoading && (
        <div className="loading">
          <h3>Loading...</h3>
          <div className="loading_container">
            <div className="block"></div>
            <div className="block"></div>
            <div className="block"></div>
            <div className="x_wing_container">
              <img src="/images/x-wing.png" alt="" className="x_wing" />
            </div>
          </div>
        </div>
      )}
      <img src="/images/star-wars.png" alt="" />
      <h1 className="title">Character Comparison</h1>
      <form className="select_boxes" onSubmit={(e) => compareCharacters(e)}>
        <div>
          <h3>Character 1: </h3>
          <select name="character_1" id="character_1_select">
            {options1Elms}
          </select>
        </div>
        <button id="button">Compare!</button>
        <div>
          <h3>Character 2: </h3>
          <select name="character_2" id="character_2_select">
            {options2Elms}
          </select>
        </div>
      </form>
      <div id="similarities">{finalOutput}</div>
    </div>
  );
}

export default App;
