// import React, { useMemo, useState, useEffect, useCallback } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   IconButton,
//   TextField,
//   InputAdornment
// } from "@mui/material";

// import { DataGrid } from "@mui/x-data-grid";

// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import SearchIcon from "@mui/icons-material/Search";

// import EmployeesAdd from "./EmployeesAdd";
// import EmployeesType from "./EmployeesType";

// import ApiServices from "../../../Services/ApiServices/ApiServices";
// import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

// const EmployeesList = () => {

//   /* ---------------- AUTH ---------------- */

//   const accessToken = useMemo(() => getDecryptedAccessToken(), []);

//   const headers = useMemo(
//     () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
//     [accessToken]
//   );

//   /* ---------------- STATE ---------------- */

//   const [openAddEmployee, setOpenAddEmployee] = useState(false);
//   const [openUserType, setOpenUserType] = useState(false);

//   const [rows, setRows] = useState([]);
//   const [search, setSearch] = useState("");

//   /* ---------------- API ---------------- */

//   const fetchEmployees = useCallback(async () => {
//     try {

//       const res = await ApiServices.get(`users/`, headers);

//       const data = res?.data ?? res;

//       console.log("EMPLOYEES LIST API RESPONSE:", data);

//       const mapped = (data?.results || []).map((user) => ({
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
//         role: user.usertype?.name || "Super Admin",
//         is_staff: user.is_staff,
//         is_superuser: user.is_superuser
//       }));

//       setRows(mapped);

//     } catch (err) {
//       console.error("Failed to fetch employees", err);
//     }
//   }, [headers]);

//   useEffect(() => {
//     fetchEmployees();
//   }, [fetchEmployees]);

//   /* ---------------- SEARCH FILTER ---------------- */

//   const filteredRows = rows.filter((row) =>
//     `${row.name} ${row.email} ${row.role}`
//       .toLowerCase()
//       .includes(search.toLowerCase())
//   );

//   /* ---------------- TABLE COLUMNS ---------------- */

//   const columns = [

//     {
//       field: "username",
//       headerName: "Username",
//       width: 200
//     },

//     {
//       field: "name",
//       headerName: "Name",
//       flex: 1,
//       minWidth: 200
//     },

//     {
//       field: "email",
//       headerName: "Email",
//       flex: 1,
//       minWidth: 250
//     },

//     {
//       field: "role",
//       headerName: "User Type",
//       width: 180
//     },

//     {
//       field: "is_staff",
//       headerName: "Staff",
//       width: 100,
//       renderCell: (params) => (params.value ? "Yes" : "No")
//     }

//   ];

//   /* ---------------- RENDER ---------------- */

//   return (
//     <Paper sx={{ p: 2, minHeight: 600, display: "flex", flexDirection: "column" }}>

//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           mb: 2
//         }}
//       >

//         <Typography variant="h6" fontWeight={700}>
//           Employees
//         </Typography>

//         <Box sx={{ display: "flex", gap: 1 }}>

//           <Button
//             variant="outlined"
//             startIcon={<AddIcon />}
//             onClick={() => setOpenUserType(true)}
//           >
//             Add User Type
//           </Button>

//           <Button
//             variant="contained"
//             startIcon={<AddIcon />}
//             onClick={() => setOpenAddEmployee(true)}
//           >
//             Add Employee
//           </Button>

//         </Box>

//       </Box>

//       {/* SEARCH */}

//       <Box sx={{ mb: 2 }}>

//         <TextField
//           size="small"
//           placeholder="Search employees..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           sx={{ width: 300 }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <SearchIcon />
//               </InputAdornment>
//             )
//           }}
//         />

//       </Box>

//       {/* EMPLOYEE TABLE */}

//       <Box sx={{ flex: 1 }}>

//         <DataGrid
//           rows={filteredRows}
//           columns={columns}
//           autoHeight
//           disableSelectionOnClick
//           pageSize={10}
//           rowsPerPageOptions={[10]}
//           sx={{
//             border: 0,
//             "& .MuiDataGrid-columnHeaders": {
//               backgroundColor: "rgba(0,0,0,0.03)"
//             }
//           }}
//         />

//       </Box>

//       {/* ---------------- ADD EMPLOYEE ---------------- */}

//       <Dialog open={openAddEmployee} fullWidth maxWidth="sm">

//         <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
//           Add Employee

//           <IconButton onClick={() => setOpenAddEmployee(false)}>
//             <CloseIcon />
//           </IconButton>

//         </DialogTitle>

//         <DialogContent>

//           <EmployeesAdd
//             headers={headers}
//             onSuccess={() => {
//               setOpenAddEmployee(false);
//               fetchEmployees();
//             }}
//           />

//         </DialogContent>

//       </Dialog>

//       {/* ---------------- ADD USER TYPE ---------------- */}

//       <Dialog open={openUserType} fullWidth maxWidth="sm">

//         <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
//           Add User Type

//           <IconButton onClick={() => setOpenUserType(false)}>
//             <CloseIcon />
//           </IconButton>

//         </DialogTitle>

//         <DialogContent>

//           <EmployeesType
//             headers={headers}
//             onSuccess={() => {
//               setOpenUserType(false);
//               fetchEmployees();
//             }}
//           />

//         </DialogContent>

//       </Dialog>

//     </Paper>
//   );
// };

// export default EmployeesList;


import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  InputAdornment,
  Snackbar
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

import EmployeesAdd from "./EmployeesAdd";
import EmployeesType from "./EmployeesType";

import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const EmployeesList = () => {

  /* ---------------- AUTH ---------------- */

  const accessToken = useMemo(() => getDecryptedAccessToken(), []);

  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  /* ---------------- STATE ---------------- */

  const [openAddEmployee, setOpenAddEmployee] = useState(false);
  const [openUserType, setOpenUserType] = useState(false);

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  /* ---------------- COPY FUNCTION ---------------- */

  const handleCopy = (text) => {
    if (!text || text === "NA") return;

    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  /* ---------------- API ---------------- */

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await ApiServices.get(`users/`, headers);
      const data = res?.data ?? res;

      console.log("EMPLOYEES LIST API RESPONSE:", data);

      const mapped = (data?.results || []).map((user) => ({
        id: user.id,
        username: user.username || "NA",
        email: user.email || "NA",
        first_name: user.first_name || "NA",
        last_name: user.last_name || "NA",
        name:
          user.first_name || user.last_name
            ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
            : "NA",
        role: user.usertype?.name || "NA",
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
        password: user.password || "NA"
      }));

      setRows(mapped);

    } catch (err) {
      console.error("Failed to fetch employees", err);
      setRows([]);
    }
  }, [headers]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /* ---------------- SEARCH FILTER ---------------- */

  const filteredRows = rows.filter((row) =>
    `${row.username} ${row.name} ${row.email} ${row.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ---------------- TABLE COLUMNS ---------------- */

  const columns = [
    {
      field: "username",
      headerName: "Username",
      width: 180
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 220
    },
    {
      field: "role",
      headerName: "User Type",
      width: 160
    },
    {
      field: "password",
      headerName: "Password",
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">
            {params.value || "NA"}
          </Typography>

          {params.value && params.value !== "NA" && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleCopy(params.value)}
            >
              Copy
            </Button>
          )}
        </Box>
      )
    },
    {
      field: "is_staff",
      headerName: "Staff",
      width: 100,
      renderCell: (params) => (params.value ? "Yes" : "No")
    },
    {
      field: "is_superuser",
      headerName: "Superuser",
      width: 120,
      renderCell: (params) => (params.value ? "Yes" : "No")
    }
  ];

  /* ---------------- RENDER ---------------- */

  return (
    <Paper sx={{ p: 2, minHeight: 600, display: "flex", flexDirection: "column" }}>

      {/* HEADER */}

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Employees
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenUserType(true)}
          >
            Add User Type
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddEmployee(true)}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* SEARCH */}

      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* TABLE */}

      <Box sx={{ flex: 1 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          autoHeight
          disableSelectionOnClick
          pageSize={10}
          rowsPerPageOptions={[10]}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "rgba(0,0,0,0.03)"
            }
          }}
        />
      </Box>

      {/* COPY SNACKBAR */}

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        message="Password copied!"
        onClose={() => setCopied(false)}
      />

      {/* ADD EMPLOYEE */}

      <Dialog open={openAddEmployee} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Add Employee
          <IconButton onClick={() => setOpenAddEmployee(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <EmployeesAdd
            headers={headers}
            onSuccess={() => {
              setOpenAddEmployee(false);
              fetchEmployees();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* ADD USER TYPE */}

      <Dialog open={openUserType} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Add User Type
          <IconButton onClick={() => setOpenUserType(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <EmployeesType
            headers={headers}
            onSuccess={() => {
              setOpenUserType(false);
              fetchEmployees();
            }}
          />
        </DialogContent>
      </Dialog>

    </Paper>
  );
};

export default EmployeesList;