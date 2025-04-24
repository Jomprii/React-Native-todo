import React, { useState, useEffect } from "react";
import {
  StatusBar,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Switch,
} from "react-native";
import { CheckBox } from "react-native-elements";
import styles from "./Style";

const API_URL = "https://api-for-todo.onrender.com/tasks"; // Backend URL

export default function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filter, setFilter] = useState("All");
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Add or update a task
  const saveTask = async () => {
    if (task.trim()) {
      try {
        if (editingTaskId) {
          // Find the task being edited
          const taskToEdit = tasks.find((t) => t.id === editingTaskId);

          if (!taskToEdit) {
            console.error("Task not found");
            return;
          }

          // Update task
          const response = await fetch(`${API_URL}/${editingTaskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: task,
              completed: taskToEdit.completed,
            }), // Include completed status
          });
          if (!response.ok) {
            throw new Error("Failed to update task");
          }
        } else {
          // Add new task
          const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: task, completed: false }),
          });
          if (!response.ok) {
            throw new Error("Failed to create task");
          }
        }
        setTask("");
        setEditingTaskId(null);
        fetchTasks(); // Refresh tasks
      } catch (error) {
        console.error("Error saving task:", error);
      }
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id) => {
    try {
      // Find the task by its ID
      const task = tasks.find((task) => task.id === id);

      if (!task) {
        console.error("Task not found");
        return;
      }

      // Send the updated task to the backend
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: task.text, completed: !task.completed }), // Include text and completed
      });

      if (!response.ok) {
        throw new Error("Failed to update task completion status");
      }

      // Refresh tasks after updating
      fetchTasks();
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  // Edit a task
  const editTask = (id, text) => {
    setTask(text);
    setEditingTaskId(id);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((item) => {
    if (filter === "Completed") return item.completed;
    if (filter === "Pending") return !item.completed;
    return true;
  });

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#f5f5f5" },
      ]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={styles.header}>
        <Text
          style={[
            styles.headertxt,
            { color: isDarkMode ? "#ffffff" : "#000000" },
          ]}
        >
          Todo App
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={() => setIsDarkMode((prevMode) => !prevMode)}
          thumbColor={isDarkMode ? "#ffffff" : "#000000"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
              color: isDarkMode ? "#ffffff" : "#000000",
            },
          ]}
          placeholder="Add or edit a task"
          placeholderTextColor={isDarkMode ? "#888888" : "#aaaaaa"}
          value={task}
          onChangeText={setTask}
        />
        <Button title={editingTaskId ? "Update" : "Add"} onPress={saveTask} />
      </View>
      <View style={styles.filterContainer}>
        {["All", "Completed", "Pending"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilter(type)}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  filter === type
                    ? isDarkMode
                      ? "#81b0ff"
                      : "#000000"
                    : "transparent",
              },
            ]}
          >
            <Text
              style={{
                color:
                  filter === type
                    ? "#ffffff"
                    : isDarkMode
                    ? "#ffffff"
                    : "#000000",
              }}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.taskItem,
              { backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff" },
            ]}
          >
            <CheckBox
              checked={item.completed}
              onPress={() => toggleTaskCompletion(item.id)}
              checkedColor={isDarkMode ? "#81b0ff" : "#000000"}
              uncheckedColor={isDarkMode ? "#ffffff" : "#000000"}
              containerStyle={{ margin: 0, padding: 0 }}
            />
            <Text
              style={{
                color: isDarkMode ? "#ffffff" : "#000000",
                textDecorationLine: item.completed ? "line-through" : "none",
                flex: 1,
              }}
            >
              {item.text}
            </Text>
            <TouchableOpacity onPress={() => editTask(item.id, item.text)}>
              <Text style={{ color: "blue", marginRight: 10 }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={{ color: "red" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
