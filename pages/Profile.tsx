import { useUsersStore } from "../store/usersStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
} from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PolygonConfig, RadarChart } from "react-native-gifted-charts";


const getStatusColor = (project_user: any) => {
    if (project_user.status === "finished") {
        if (project_user.final_mark >= 80) {
            return "#00FF00"; // Green
        } else if (project_user.final_mark >= 32) {
            return "#FFFF00"; // Yellow
        } else {
            return "#FF0000"; // Red
        }
    }
        
}



const  Profile = (params: any) => {
  const route = useRoute();
  const { student } = route.params as { student: any };
  const navigation = useNavigation();




  const [seeMore, setSeeMore] = useState(false);
  const animationHeight = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(animationHeight, {
        toValue: seeMore ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [seeMore]);

  const displayProjects = (projects_users: any) => {
      // Sort and filter projects
      const sortedProjects = projects_users
        .sort((a: any, b: any) => {
          if (a.status === "in_progress" && b.status !== "in_progress") {
            return -1;
          }
          if (a.status !== "in_progress" && b.status === "in_progress") {
            return 1;
          }
          // @ts-expect-error 
          return new Date(b.marked_at) - new Date(a.marked_at);
        })
        .filter((project_user: any) => {
          return (
            project_user.status === "in_progress" ||
            project_user.status === "finished" ||
            project_user.validated === false
          );
        });

      // Split projects
      const visibleProjects = seeMore ? sortedProjects : sortedProjects.slice(0, 5);
      const extraProjects = sortedProjects.slice(5);

      // Animation effect

      // Calculate max height
      const projectHeight = 40;
      const maxExtraHeight = extraProjects.length * projectHeight;

      // Render individual project
      const renderProject = (project_user: any) => (
        <View key={project_user.id} style={styles.projectContainer}>
          <Text
            style={[
              styles.projectName,
              {
                fontSize: project_user.project.name.length > 30 ? 12 : 14,
              },
            ]}
          //   numberOfLines={1}
          //   ellipsizeMode="tail"
          >
            {project_user.project.name}
          </Text>
          <View style={styles.project_mark}>
            <View>
              {project_user.final_mark !== null ? (
                <Text style={styles.projectName_mark}>
                  {project_user.final_mark}%
                </Text>
              ) : (
                <Text style={styles.projectName_mark}>In Progress</Text>
              )}
            </View>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(project_user) },
              ]}
            />
          </View>
        </View>
      );

      return (
        <View>
          {visibleProjects.map(renderProject)}
          {extraProjects.length > 0 && (
            <>
              <Animated.View
                style={[
                  styles.extraProjectsContainer,
                  {
                    height: animationHeight.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, maxExtraHeight],
                    }),
                    opacity: animationHeight,
                  },
                ]}
              >
                {extraProjects.map(renderProject)}
              </Animated.View>
              <TouchableOpacity
                style={styles.seeMoreButton}
                onPress={() => setSeeMore(!seeMore)}
              >
                <Text style={styles.seeMoreText}>
                  {seeMore ? "See Less" : "See More"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    };

  const getAverage = (projects_users: any) => {
    let sum = 0;
    let count = 0;
    projects_users.forEach((project_user: any) => {
      if (project_user.final_mark !== null) {
        sum += project_user.final_mark;
        count++;
      }
    });
    return Math.round(sum / count);
  };

  const getSkillsData = (skills: any) => {
    return {
      labels: skills
        
        .map((skill: any) =>
          skill.name.length > 15 ? `${skill.name.slice(0, 12)}...` : skill.name
        ),
      data: skills
        
        .map((skill: any) => parseFloat(skill.level)),
    };
  };

  if (!student) {
    return <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000", // Dark background
        height :300
    }}
    >

        <Text style={styles.text}>Loading...</Text>
    </View>
    
  }
  const radarData = getSkillsData(student.cursus_users[1].skills);
  const polygonConfig: PolygonConfig = {
    
    stroke: "#FF8040", // Orange stroke to match your theme
    strokeWidth: 2, // Bold outline
    fill: "rgba(255, 128, 64, 0.4)", // Semi-transparent orange fill
    // gradientColor: "#000" ,      // Gradient fades to black (matches background)
    gradientOpacity: 0.8, // Moderate gradient opacity
    opacity: 1, // Slightly transparent polygon
    isAnimated: true, // Enable animation
    animationDuration: 1000, // 1-second animation for smooth entry
  };
  const labelConfig: any = {
    fontSize: 12, // Smaller size to fit long labels
    stroke: "#FFF", // White stroke to match theme
    textAnchor: "middle", // Center-align labels
    alignmentBaseline: "middle", // Vertically center
    fontFamily: "Courier New", // Match your theme’s font
  };
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Image
          style={styles.studentImage}
          source={{ uri: student.image.link }}
          resizeMode="cover"
        />
        <Text style={styles.login}>{student.login}</Text>
        <Text style={styles.text}>
          {student.first_name} {student.last_name}
        </Text>
        <View style={styles.flexWrapContainer}>
          <Text style={styles.text}>Email: {student.email}</Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.text}>
            Phone number: {student.phone}
          </Text>
          <Text style={styles.text}>Campus: {student.campus[0].city}</Text>
          <Text style={styles.text}>Wallet: {student.wallet}</Text>
          <Text style={styles.text}>
            Correction points: {student.correction_point}
          </Text>
          <Text style={styles.text}>
            Level: {student.cursus_users[1].level}
          </Text>
          {student.cursus_users[1].grade !== null && (
            <Text style={styles.text}>
              Grade: {student.cursus_users[1].grade}
            </Text>
          )}
        </View>
        {student.cursus_users[1].blackholed_at !== null ? (
          <Text style={styles.text}>
            Day left:{" "}
            {Math.round(
              //@ts-ignore
              (new Date(student.cursus_users[1].blackholed_at) - new Date()) /
                (1000 * 60 * 60 * 24)
            )}
          </Text>
        ) : (
          <Text style={styles.text}>No BlackHool</Text>
        )}
        <View style={styles.separator} />
   

        {student.cursus_users[1].skills.length > 0 && (
          <Text style={styles.text_project}>Skills (Radar Chart):</Text>
        )}
        {student.cursus_users[1].skills.length > 0 && (
          <View style={styles.radarContainer}>
            <RadarChart
              data={radarData.data}
              labels={radarData.labels}
              polygonConfig={polygonConfig}
              chartSize={250} //
              gridConfig={{
                gradientColor: "#000", // Gradient color for the grid
                gradientOpacity: 0.1, // Gradient opacity for the grid
              }}
              labelConfig={labelConfig}
            />
          </View>
        )}

        <View style={styles.separator} />
        {student.projects_users.length > 0 && (
          <Text style={styles.text_project}>Projects:</Text>
        )}
        {student.projects_users.length > 0 && (
          <Text style={styles.text_project}>
            Average: {getAverage(student.projects_users)}%
          </Text>
        )}
        {displayProjects(student.projects_users)}
        <View style={styles.separator} />
        <View style={styles.separator} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#000" 

}, 
  extraProjectsContainer: {
    overflow: "hidden", 
  },
  radarContainer: {
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  seeMoreButton: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  seeMoreText: {
    color: "#FF8040", // Matches your button color scheme
    fontFamily: "Courier New",
    fontSize: 14,
    fontWeight: "bold",
  },
  projectContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
    height: 40, // Explicit height for consistent animation calculation
  },
  container: {
    alignItems: "center",
    padding: 16,
  },
  topBar: {
    height: 60,
    backgroundColor: "#111", // Slightly lighter than main background
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3b3a3a",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "Courier New",
  },
  flexWrapContainer: {
    flex: 1,
    width: "100%",
    // backgroundColor: "red",
    alignItems: "center",
    display: "flex",
  },
  text: {
    flex: 1,
    alignItems: "center",
    padding: 5,
    fontFamily: "Courier New",
    // Remove the numberOfLines property

    fontSize: 17,
    color: "#FFF", // Added color, assuming it was dark text on light bg; now light on dark
  },
  text_project: {
    flex: 1,
    alignItems: "flex-start",
    paddingRight: 16,
    padding: 8,
    fontWeight: "bold",
    fontFamily: "Courier New",
    fontSize: 18,
    color: "#fff", // Added color, assuming dark text; now white
  },
  login: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    fontWeight: "bold",
    fontFamily: "Courier New",
    fontSize: 15,
    color: "#fff", // Added color, assuming dark text; now white
  },
  searchContainer: {
    width: "100%",
    backgroundColor: "transparent",
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
    marginBottom: 16,
  },
  searchInputContainer: {
    backgroundColor: "#000", // Was white
    borderRadius: 4,
  },
  project_mark: {
    flexDirection: "row",
    lineHeight: 40,
    height: 15,
  },
  studentImage: {
    borderWidth: 2,
    borderColor: "#FF8040", // Was gray, now white for visibility on dark bg
    width: 200,
    height: 200,
    borderRadius: 50,
    marginBottom: 10,
  },
  containersearch: {
    flex: 1,
    marginTop: 1,
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: "#fff", // Added color, assuming dark text; now white
  },
  button: {
    backgroundColor: "#FF8040", // Was #007BFF (blue), now a contrasting orange
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row_grademe: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 30,
  },
  projectName: {
    flex: 1,
    marginRight: 8,
    color: "#fff", // Added color, assuming dark text; now white
  },
  projectName_mark: {
    flex: 1,
    marginRight: 8,
    fontWeight: "bold",
    fontFamily: "Courier New",
    fontSize: 16,
    color: "#999", // Was gray, now a lighter gray for contrast on dark bg
  },
  input: {
    width: "100%",
    borderColor: "#fff", // Was gray, now white for visibility on dark bg
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#333", // Added background, dark gray for input field
    color: "#fff", // Added text color, white for readability
  },

  separator: {
    borderBottomColor: "#fff", // Was black, now white
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  image: {
    width: 400,
    height: 100,
    marginTop: 10,
  },
  skillContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#222", // Added dark background for contrast
  },
  skillName: {
    fontSize: 14,
    flex: 1,
    color: "#fff", // Added color, assuming dark text; now white
  },
  skill_level: {
    flexDirection: "row",
    alignItems: "center",
  },
  skillName_level: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "bold",
    color: "#fff", // Added color, assuming dark text; now white
  },
});

export default Profile;
