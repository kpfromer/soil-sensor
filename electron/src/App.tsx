import React, { useEffect, useState } from "react";
import { Box, Heading, Flex, Text } from "rebass";
// import { VictoryChart, VictoryLine, VictoryTheme } from "victory";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

function toPrecision(number: number, precision: number) {
  return Math.floor(Math.pow(10, precision) * number) / Math.pow(10, precision);
}

function App() {
  const [temp, setTemp] = useState<{ time: number; temperature: number }[]>([]);
  const [data, setData] = useState({ temperature: 0, moisture: 0 });

  useEffect(() => {
    const removeListener = ipc.answerMain(
      "data",
      (data: { temperature: number; moisture: number }) => {
        setData(data);
        setTemp((temp) =>
          [
            ...temp,
            {
              time: temp.length > 0 ? temp[temp.length - 1].time + 1 : 1,
              temperature: toPrecision((data.temperature * 212) / 100 + 32, 2),
            },
          ].slice(Math.max(0, temp.length - 10))
        );
      }
    );
    return removeListener;
  }, []);

  return (
    <Flex mx="auto" p={3}>
      <Box width="80%" sx={{ maxWidth: 1250 }}>
        <Heading fontSize={5}>Kyle's Plant System</Heading>
        <Text>Thanks to zeromq!</Text>
        <Heading>
          Temperature: {toPrecision((data.temperature * 212) / 100 + 32, 2)} °F
        </Heading>
        <Heading>
          Moisture: {toPrecision((data.moisture / 1015) * 100, 2)}%
        </Heading>
        <Box ml={4}>
          <LineChart
            width={730}
            height={250}
            data={temp}
            min
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[70, "auto"]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
            {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
          </LineChart>
        </Box>
      </Box>
    </Flex>
  );
}

export default App;
