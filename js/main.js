const liftInput = document.querySelector("#lifts");
const floorInput = document.querySelector("#floors");

const simulateInp = document.querySelector(".Submit");
//const clearInp = document.querySelector(".clear");
const simulatedUIDiv = document.querySelector(".simulatedUI");

let floorToLiftsMap;
let liftToFloorMap;
let liftArr;
let busyLifts;
let notBusyLifts;
let liftYPos;
let liftDir;

function init() {
  const lifts = Number(liftInput.value);
  const floors = Number(floorInput.value);

  if (validateInput(lifts, floors) == false) {
    console.log("Invalid lifts/floors Input");
    return;
  }

  console.log(
    `Initializing environment for lifts: ${lifts} and floors: ${floors}...`
  );

  renderUI(lifts, floors);
  disableForm();

  floorToLiftsMap = new Map();
  liftToFloorMap = new Map();
  liftArr = [];
  busyLifts = new Set();
  notBusyLifts = new Set();
  liftYPos = [];
  liftDir = [];

  for (let i = 1; i <= lifts; i++) {
    notBusyLifts.add(i);
    liftArr.push(i);
    liftYPos.push(0);
    liftDir.push("up");
    liftToFloorMap.set(i, 1); // initially every lift is present on 1st floor
  }

  floorToLiftsMap.set(1, liftArr);
  for (let i = 2; i <= floors; i++) {
    floorToLiftsMap.set(i, []); // storing every floor's initial lift information
  }
}

function validateInput(lifts, floors) {
  let ans = true;
  let errorText = "";
  if (!Number.isInteger(floors) || isNaN(floors) || floors < 2) {
    errorText += "Floors can only be a positive integer greater than 2.\n";
    ans = false;
  }
  if (!Number.isInteger(lifts) || isNaN(lifts) || lifts < 1) {
    errorText += "Lifts can only be a positive integer greater than 1.";
    ans = false;
  }
  if (ans == false) {
    alert(errorText);
  }
  return ans;
}

function renderUI(lifts, floors) {
  for (let i = +floors; i >= 1; i--) {
    const floorDiv = document.createElement("div");
    floorDiv.className = "floor";
    floorDiv.id = `floor${i}`;
    console.log(floorDiv.id);
    simulatedUIDiv.appendChild(floorDiv);
  }

  if (floors != 1) {
    for (let i = floors; i >= 1; i--) {
      const floorDiv = document.querySelector(`#floor${i}`);
      const controlDiv = document.createElement("div");
      controlDiv.className = "control";
      controlDiv.id = `control${i}`;

      const upSpan = document.createElement("span");
      const upBtn = document.createElement("button");
      upBtn.textContent = "U";
      upBtn.addEventListener("click", () => {
        move(i, "up");
      });
      upSpan.appendChild(upBtn);

      const floorName = document.createElement("span");
      floorName.textContent = i;

      const downSpan = document.createElement("span");
      const downBtn = document.createElement("button");
      downBtn.textContent = "D";
      downBtn.addEventListener("click", () => {
        move(i, "down");
      });
      downSpan.appendChild(downBtn);

      if (i == 1) {
        controlDiv.appendChild(upSpan);
        controlDiv.appendChild(floorName);
      } else if (i == floors) {
        controlDiv.appendChild(downSpan);
        controlDiv.appendChild(floorName);
      } else {
        controlDiv.appendChild(upSpan);
        controlDiv.appendChild(floorName);
        controlDiv.appendChild(downSpan);
      }
      console.log(floorDiv.id);
      floorDiv.appendChild(controlDiv);
    }

    for (let i = 1; i <= lifts; i++) {
      const firstFloor = document.querySelector("#floor1");
      const liftDiv = document.createElement("div");
      liftDiv.className = "lift";
      liftDiv.id = `lift${i}`;
      firstFloor.appendChild(liftDiv);
      const leftDoor = document.createElement("div");
      //leftDoor.className = "door";
      leftDoor.className = "door ldoor";
      leftDoor.id = `leftDoor${i}`;
      liftDiv.appendChild(leftDoor);
      const rightDoor = document.createElement("div");
      //rightDoor.className = "door";
      rightDoor.className = "door rdoor";
      rightDoor.id = `rightDoor${i}`;
      liftDiv.appendChild(rightDoor);
    }
  }
}

function disableForm() {
  liftInput.disabled = true;
  liftInput.className = floorInput.className = "";
  floorInput.disabled = true;
  simulateInp.disabled = true;
  simulateInp.className = "Submit";
  //clearInp.disabled = false;
  //clearInp.className = "clear enabledButton";
}

/*function clearPage() {
  liftInput.value = 1;
  liftInput.disabled = false;
  floorInput.value = 2;
  floorInput.disabled = false;
  liftInput.className = floorInput.className = "enabledInput";
  simulateInp.disabled = false;
  simulateInp.className = "Submit enabledButton";
  clearInp.disabled = true;
  clearInp.className = "clear";
  while (simulatedUIDiv.firstChild) {
    simulatedUIDiv.removeChild(simulatedUIDiv.firstChild);
  }
}*/

simulateInp.addEventListener("click", init);
//clearInp.addEventListener("click", clearPage);

//after reaching target floor, user wants to go in which direction (up,down)
function move(target, direction) {
  console.log("move to " + target + " in direction " + direction);
  let up = Number(target),
    down = Number(target);
  const floors = Number(floorInput.value);

  // If all lifts are busy, wait for 2.5 sec for event to start again
  if (busyLifts.size === Number(liftInput.value)) {
    setTimeout(move, 2500, target, direction);
  }

  const lifts = Number(liftInput.value);
  if (lifts == 1 && floorToLiftsMap.get(target).length == 1) {
    if (!busyLifts.has(1)) openDoors(1, 0, true);
    return;
  }

  if (
    floorToLiftsMap.get(target).length == 0 ||
    isLiftDirectionDiff(direction, floorToLiftsMap.get(target)) === 0
  ) {
    while (up <= floors || down >= 1) {
      up++;
      down--;
      if (floorToLiftsMap.has(up) && floorToLiftsMap.get(up).length != 0) {
        moveLiftHelper(up, direction, target);
        break;
      }
      if (floorToLiftsMap.has(down) && floorToLiftsMap.get(down).length != 0) {
        moveLiftHelper(down, direction, target);
        break;
      }
    }
  }
}

function isLiftDirectionDiff(direction, liftList) {
  let ans = 0;
  for (let i = 0; i < liftList.length; i++) {
    if (direction == liftDir[liftList[i] - 1]) {
      ans = 1;
      if (!busyLifts.has(liftList[i])) openDoors(liftList[i], 0, true);
      break;
    }
  }
  return ans;
}

function moveLiftHelper(source, direction, target) {
  let i = 0;
  let toBeUsedLift = 0;
  for (i = 0; i < floorToLiftsMap.get(source).length; i++) {
    if (!busyLifts.has(floorToLiftsMap.get(source)[i])) {
      toBeUsedLift = floorToLiftsMap.get(source)[i];
      floorToLiftsMap.get(source).splice(i, 1);
      busyLifts.add(toBeUsedLift);
      liftDir[toBeUsedLift - 1] = direction;
      console.log(toBeUsedLift + " lift is available on floor" + source);
      startAnimation(toBeUsedLift, target, target - source);
      break;
    }
  }
}

function startAnimation(liftId, target, diff) {
  const lift = document.getElementById(`lift${liftId}`);
  let current = liftYPos[liftId - 1];
  console.log("current y:" + liftYPos[liftId - 1]);
  liftYPos[liftId - 1] = liftYPos[liftId - 1] - diff * 103;
  const keyframesLocal = new KeyframeEffect(
    lift,
    [
      { transform: `translateY(${current}px)` },
      { transform: `translateY(${liftYPos[liftId - 1]}px)` },
    ],
    {
      duration: 2000 * Math.abs(diff),
      fill: "both",
    }
  );

  const liftAnimation = new Animation(keyframesLocal, document.timeline);
  liftAnimation.play();
  liftAnimation.onfinish = () => {
    console.log("new y:" + liftYPos[liftId - 1]);
    console.log("Lift has reached the target floor..");
    openDoors(liftId, target, false);
  };
}

function openDoors(liftId, target, onSameFloor) {
  console.log("Doors Opening..");
  const leftDoor = document.getElementById(`leftDoor${liftId}`);
  const rightDoor = document.getElementById(`rightDoor${liftId}`);
  const ldoorOpenKeyFrame = new KeyframeEffect(
    leftDoor,
    [{ transform: `translateX(-100%) scaleX(0)` }],
    {
      duration: 2500,
      easing: "linear",
      direction: "alternate",
      iterations: 2,
    }
  );

  const rdoorOpenKeyFrame = new KeyframeEffect(
    rightDoor,
    [{ transform: `translateX(100%) scaleX(0)` }],
    {
      duration: 2500,
      easing: "linear",
      direction: "alternate",
      iterations: 2,
    }
  );

  const ldoorAnimation = new Animation(ldoorOpenKeyFrame, document.timeline);
  const rdoorAnimation = new Animation(rdoorOpenKeyFrame, document.timeline);
  if (!busyLifts.has(liftId)) {
    busyLifts.add(liftId);
  }
  ldoorAnimation.play();
  rdoorAnimation.play();

  ldoorAnimation.onfinish = () => {
    busyLifts.delete(liftId);
    if (!onSameFloor) {
      floorToLiftsMap.get(target).push(liftId);
    }
  };
}
