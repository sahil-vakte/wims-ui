import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import OrderBatchManager from "./OrderBatchManager";
import OrderBatchDetailTab from "./OrderBatchDetailTab";

const ORDERS_TAB = "orders";
const BATCHES_TAB = "batches";

const todayKey = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
};

const OrderTabs = ({ headers, disabled = false, onRefreshOrders }) => {
  const [activeTab, setActiveTab] = useState(ORDERS_TAB);
  const [batchTabs, setBatchTabs] = useState([]);

  // Persist the Existing Batches date filter while switching tabs.
  const [existingBatchesDate, setExistingBatchesDate] = useState(todayKey());

  const handleOpenBatch = useCallback((batch) => {
    if (!batch?.id) return;

    const tabId = `batch-${batch.id}`;

    setBatchTabs((current) => {
      const alreadyOpen = current.some((tab) => tab.id === tabId);

      if (alreadyOpen) {
        return current;
      }

      return [
        ...current,
        {
          id: tabId,
          batchId: batch.id,
          label: batch.batch_name || `Batch #${batch.id}`,
        },
      ];
    });

    setActiveTab(tabId);
  }, []);

  const handleCloseBatchTab = useCallback(
    (event, tabId) => {
      event.stopPropagation();

      setBatchTabs((currentTabs) => {
        const closingIndex = currentTabs.findIndex((tab) => tab.id === tabId);
        const nextTabs = currentTabs.filter((tab) => tab.id !== tabId);

        if (activeTab === tabId) {
          if (nextTabs.length) {
            const nextIndex = Math.min(
              Math.max(closingIndex - 1, 0),
              nextTabs.length - 1,
            );

            setActiveTab(nextTabs[nextIndex].id);
          } else {
            setActiveTab(BATCHES_TAB);
          }
        }

        return nextTabs;
      });
    },
    [activeTab],
  );

  const selectedBatchTab = useMemo(
    () => batchTabs.find((tab) => tab.id === activeTab),
    [activeTab, batchTabs],
  );

  const handleBatchUpdated = useCallback(async () => {
    await onRefreshOrders?.();
  }, [onRefreshOrders]);

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        variant="outlined"
        sx={{
          mb: 2,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 52,
            "& .MuiTab-root": {
              minHeight: 52,
              textTransform: "none",
            },
          }}
        >
          <Tab
            value={ORDERS_TAB}
            icon={<ReceiptLongOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Orders / Create Batch"
          />

          <Tab
            value={BATCHES_TAB}
            icon={<Inventory2OutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Existing Batches"
          />

          {batchTabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              component="div"
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    maxWidth: 220,
                  }}
                >
                  <Typography
                    component="span"
                    variant="body2"
                    noWrap
                    sx={{ maxWidth: 160 }}
                  >
                    {tab.label}
                  </Typography>

                  <Tooltip title={`Close ${tab.label}`}>
                    <IconButton
                      component="span"
                      size="small"
                      onClick={(event) => handleCloseBatchTab(event, tab.id)}
                      sx={{ p: 0.25 }}
                    >
                      <CloseIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {activeTab === ORDERS_TAB && (
        <OrderBatchManager
          headers={headers}
          disabled={disabled}
          onRefreshOrders={onRefreshOrders}
          showOrders
          showBatches={false}
        />
      )}

      {activeTab === BATCHES_TAB && (
        <OrderBatchManager
          headers={headers}
          disabled={disabled}
          onRefreshOrders={onRefreshOrders}
          showOrders={false}
          showBatches
          onOpenBatch={handleOpenBatch}
          existingBatchesDate={existingBatchesDate}
          onExistingBatchesDateChange={setExistingBatchesDate}
        />
      )}

      {selectedBatchTab && (
        <OrderBatchDetailTab
          key={selectedBatchTab.id}
          batchId={selectedBatchTab.batchId}
          headers={headers}
          onUpdated={handleBatchUpdated}
        />
      )}
    </Box>
  );
};

export default OrderTabs;
