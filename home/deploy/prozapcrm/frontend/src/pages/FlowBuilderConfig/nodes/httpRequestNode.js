import React, { memo } from "react";
import { Handle, Position } from "react-flow-renderer";
import { Box, Typography, useTheme } from "@mui/material";
import { Http } from "@mui/icons-material";

const HttpRequestNode = ({ data, id }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const modernStyles = {
    glassmorphism: {
      background: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "16px",
      boxShadow: isDark
        ? "0 8px 25px rgba(0,0,0,0.4)"
        : "0 8px 25px rgba(0,0,0,0.1)",
    },
    nodeColor: "#667eea", // Matches FlowBuilderConfig MiniMap color for httpRequest
  };

  return (
    <Box
      sx={{
        ...modernStyles.glassmorphism,
        padding: "16px",
        minWidth: "200px",
        maxWidth: "300px",
        position: "relative",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          border: "3px solid white",
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Http sx={{ color: modernStyles.nodeColor, fontSize: 20 }} />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)",
          }}
        >
          {data.label || "HTTP Request"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
          }}
        >
          <strong>Método:</strong> {data.method || "Não definido"}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
            wordBreak: "break-all",
          }}
        >
          <strong>URL:</strong> {data.url || "Não definida"}
        </Typography>
      </Box>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          border: "3px solid white",
        }}
      />
    </Box>
  );
};

export default memo(HttpRequestNode);
