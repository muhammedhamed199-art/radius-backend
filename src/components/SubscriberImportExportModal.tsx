/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { 
  Upload, 
  Download, 
  FileText, 
  FileCode, 
  Database, 
  Check, 
  Copy, 
  X, 
  AlertCircle, 
  Sparkles, 
  Terminal, 
  Users, 
  Settings, 
  FileSpreadsheet,
  RefreshCw,
  HelpCircle,
  Filter,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  ListFilter,
  Search,
  FileDown
} from "lucide-react";
import { Customer, CustomerStatus, ConnectionType, SpeedOffer, NasServer, Distributor } from "../types";

interface SubscriberImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  offers: SpeedOffer[];
  servers: NasServer[];
  distributors: Distributor[];
  selectedCustomerIds: string[];
  filteredCustomers: Customer[];
  onImportCustomers: (newCustomers: Omit<Customer, "id">[], duplicateMode: "skip" | "overwrite" | "append") => void;
}

export type ExportFormat = "csv" | "excel" | "json" | "freeradius_users" | "freeradius_sql" | "mikrotik_ppp" | "mikrotik_hotspot" | "mikrotik_usermanager" | "txt_simple";
export type ImportPreset = "auto" | "excel_csv" | "json" | "freeradius" | "mikrotik" | "txt";

export interface FieldMapping {
  name: string;
  username: string;
  password: string;
  phone: string;
  region: string;
  ipAddress: string;
  connectionType: string;
  offerNameOrId: string;
  expiryDate: string;
  status: string;
  debt: string;
  macAddress: string;
}

interface ParsedImportCustomer {
  selected: boolean;
  name: string;
  username: string;
  password?: string;
  phone?: string;
  region?: string;
  ipAddress?: string;
  connectionType?: ConnectionType;
  offerNameOrId?: string;
  expiryDate?: string;
  status?: CustomerStatus;
  debt?: number;
  macAddress?: string;
  rawLine?: string;
  error?: string;
}

const DEFAULT_MAPPING: FieldMapping = {
  name: "",
  username: "",
  password: "",
  phone: "",
  region: "",
  ipAddress: "",
  connectionType: "",
  offerNameOrId: "",
  expiryDate: "",
  status: "",
  debt: "",
  macAddress: ""
};

export default function SubscriberImportExportModal({
  isOpen,
  onClose,
  customers,
  offers,
  servers,
  distributors,
  selectedCustomerIds,
  filteredCustomers,
  onImportCustomers
}: SubscriberImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");

  // --- IMPORT STATES ---
  const [importText, setImportText] = useState("");
  const [importPreset, setImportPreset] = useState<ImportPreset>("auto");
  const [defaultServerId, setDefaultServerId] = useState<string>(servers[0]?.id || "");
  const [defaultOfferId, setDefaultOfferId] = useState<string>(offers[0]?.id || "");
  const [defaultConnectionType, setDefaultConnectionType] = useState<ConnectionType>(ConnectionType.PPPOE);
  const [duplicateMode, setDuplicateMode] = useState<"skip" | "overwrite" | "append">("skip");
  const [parsedRows, setParsedRows] = useState<ParsedImportCustomer[]>([]);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  
  // Excel / CSV Specific States & Column Mapping
  const [fileName, setFileName] = useState<string | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [rawMatrix, setRawMatrix] = useState<any[][]>([]);
  const [mapping, setMapping] = useState<FieldMapping>(DEFAULT_MAPPING);
  const [showMappingPanel, setShowMappingPanel] = useState<boolean>(true);
  const [previewSearch, setPreviewSearch] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // --- EXPORT STATES ---
  const [exportScope, setExportScope] = useState<"all" | "selected" | "filtered">("all");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [copiedFormat, setCopiedFormat] = useState(false);
  const [customTxtSeparator, setCustomTxtSeparator] = useState(":");

  // Determine list of customers for export
  const exportTargetCustomers = useMemo(() => {
    if (exportScope === "selected") {
      return customers.filter(c => selectedCustomerIds.includes(c?.id));
    }
    if (exportScope === "filtered") {
      return filteredCustomers;
    }
    return customers;
  }, [exportScope, selectedCustomerIds, filteredCustomers, customers]);

  // Auto-detect mappings from headers
  const autoDetectMapping = (headers: string[]): FieldMapping => {
    const findMatch = (keywords: string[]): string => {
      for (const kw of keywords) {
        const match = headers.find(h => {
          if (!h) return false;
          const cleanH = String(h).trim().toLowerCase().replace(/[_-\s]+/g, '');
          const cleanKw = kw.trim().toLowerCase().replace(/[_-\s]+/g, '');
          return cleanH === cleanKw || cleanH.includes(cleanKw) || cleanKw.includes(cleanH);
        });
        if (match) return match;
      }
      return "";
    };

    return {
      name: findMatch(["اسم المشترك", "الاسم", "اسم العميل", "العميل", "المشترك", "Name", "Full Name", "FullName", "Customer"]),
      username: findMatch(["اسم المستخدم", "اليوزر", "اسم الحساب", "حساب المستخدم", "Username", "User", "Account", "Login", "Uname"]),
      password: findMatch(["كلمة المرور", "السر", "الباسورد", "كلمه السر", "Password", "Pass", "Secret", "Pwd"]),
      phone: findMatch(["الهاتف", "رقم الهاتف", "الجوال", "الموبايل", "الواتس", "Phone", "Mobile", "Tel", "Cell"]),
      region: findMatch(["المنطقة", "العنوان", "المدينة", "الموقع", "Region", "Address", "City", "Location"]),
      ipAddress: findMatch(["الاي بي", "العنوان IP", "الايبي", "عنوان الاي بي", "IP", "IPAddress", "Ip_Address", "Address"]),
      connectionType: findMatch(["نوع الاتصال", "طريقة الاتصال", "الخدمة", "Type", "ConnectionType", "Service"]),
      offerNameOrId: findMatch(["الباقة", "العرض", "السرعة", "البروفايل", "Offer", "Package", "Plan", "Profile", "Speed"]),
      expiryDate: findMatch(["تاريخ الانتهاء", "الانتهاء", "تاريخ الانتهاء", "تاريخ التجديد", "Expiry", "ExpiryDate", "Expiration"]),
      status: findMatch(["الحالة", "حالة الحساب", "Status", "State"]),
      debt: findMatch(["الدين", "الديون", "الذمم", "المبلغ", "Debt", "Balance"]),
      macAddress: findMatch(["الماك", "عنوان الماك", "الماك ادريس", "MAC", "MacAddress", "MAC_Address"])
    };
  };

  // Process raw matrix rows into ParsedImportCustomer list using current mapping
  const processMatrixWithMapping = (headers: string[], matrixRows: any[][], currentMapping: FieldMapping) => {
    if (!headers.length || !matrixRows.length) {
      setParsedRows([]);
      return;
    }

    const results: ParsedImportCustomer[] = matrixRows.map((row, idx) => {
      const getVal = (headerName: string): string => {
        if (!headerName) return "";
        const colIdx = headers.indexOf(headerName);
        if (colIdx === -1) return "";
        const val = row[colIdx];
        if (val === undefined || val === null) return "";
        return String(val).trim();
      };

      const rawName = getVal(currentMapping.name);
      const rawUsername = getVal(currentMapping.username);
      const rawPassword = getVal(currentMapping.password);
      const rawPhone = getVal(currentMapping.phone);
      const rawRegion = getVal(currentMapping.region);
      const rawIp = getVal(currentMapping.ipAddress);
      const rawConnType = getVal(currentMapping.connectionType);
      const rawOffer = getVal(currentMapping.offerNameOrId);
      const rawExpiry = getVal(currentMapping.expiryDate);
      const rawStatus = getVal(currentMapping.status);
      const rawDebt = getVal(currentMapping.debt);
      const rawMac = getVal(currentMapping.macAddress);

      // Interpret connection type
      let connType: ConnectionType = defaultConnectionType;
      if (rawConnType) {
        const lowerConn = rawConnType.toLowerCase();
        if (lowerConn.includes("pppoe") || lowerConn.includes("برودباند")) connType = ConnectionType.PPPOE;
        else if (lowerConn.includes("hotspot") || lowerConn.includes("هوتسبوت") || lowerConn.includes("كروت")) connType = ConnectionType.HOTSPOT;
        else if (lowerConn.includes("mac") || lowerConn.includes("ماك")) connType = ConnectionType.MAC;
        else if (lowerConn.includes("mixed") || lowerConn.includes("مختلط")) connType = ConnectionType.MIXED;
      }

      // Interpret status
      let custStatus: CustomerStatus = CustomerStatus.ACTIVE;
      if (rawStatus) {
        const lowerStat = rawStatus.toLowerCase();
        if (lowerStat.includes("منتهي") || lowerStat.includes("expired") || lowerStat.includes("مغلق") || lowerStat.includes("معطل")) {
          custStatus = CustomerStatus.EXPIRED;
        } else if (lowerStat.includes("موقوف") || lowerStat.includes("suspended") || lowerStat.includes("حظر")) {
          custStatus = CustomerStatus.SUSPENDED;
        }
      }

      const parsedDebt = parseFloat(rawDebt.replace(/[^0-9.-]/g, "")) || 0;
      const finalUsername = rawUsername || rawName || `user_${idx + 1}`;
      const finalName = rawName || rawUsername || `مشترك ${idx + 1}`;

      return {
        selected: Boolean(finalUsername),
        name: finalName,
        username: finalUsername,
        password: rawPassword || "123456",
        phone: rawPhone,
        region: rawRegion,
        ipAddress: rawIp,
        connectionType: connType,
        offerNameOrId: rawOffer,
        expiryDate: rawExpiry,
        status: custStatus,
        debt: parsedDebt,
        macAddress: rawMac
      };
    });

    setParsedRows(results);
  };

  // Re-run mapping processing whenever mapping, headers, or matrix changes
  useEffect(() => {
    if (detectedHeaders.length > 0 && rawMatrix.length > 0) {
      processMatrixWithMapping(detectedHeaders, rawMatrix, mapping);
    }
  }, [mapping, detectedHeaders, rawMatrix, defaultConnectionType]);

  if (!isOpen) return null;

  // Process Excel sheet selection
  const handleSheetChange = (sheetName: string, wb = workbook) => {
    if (!wb) return;
    setActiveSheet(sheetName);
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return;

    // Convert sheet to array of arrays
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!data || data.length === 0) {
      setDetectedHeaders([]);
      setRawMatrix([]);
      setParsedRows([]);
      return;
    }

    // Header row is first non-empty row
    const firstRowIndex = data.findIndex(row => row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ""));
    if (firstRowIndex === -1) {
      setDetectedHeaders([]);
      setRawMatrix([]);
      setParsedRows([]);
      return;
    }

    const headers = data[firstRowIndex].map((h: any, i: number) => h ? String(h).trim() : `عمود ${i + 1}`);
    const rows = data.slice(firstRowIndex + 1).filter(r => r.some((c: any) => c !== undefined && c !== null && String(c).trim() !== ""));

    setDetectedHeaders(headers);
    setRawMatrix(rows);

    const autoMap = autoDetectMapping(headers);
    setMapping(autoMap);
    processMatrixWithMapping(headers, rows, autoMap);
  };

  // Handle Binary File Upload (.xlsx, .xls, .csv) or Text
  const handleFileChange = (file: File) => {
    if (!file) return;
    setFileName(file.name);

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".ods");
    
    const reader = new FileReader();

    if (isExcel) {
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const wb = XLSX.read(buffer, { type: "array" });
          setWorkbook(wb);
          setSheetNames(wb.SheetNames);
          if (wb.SheetNames.length > 0) {
            handleSheetChange(wb.SheetNames[0], wb);
          }
        } catch (err) {
          alert("❌ تعذر قراءة ملف Excel، أعد التأكد من سلامة الملف.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Text or CSV file
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          setImportText(content);
          parseCsvOrTextFile(content);
        }
      };
      reader.readAsText(file);
    }
  };

  // Parse CSV or Text content with header detection and column mapping
  const parseCsvOrTextFile = (rawContent: string) => {
    if (!rawContent.trim()) {
      setDetectedHeaders([]);
      setRawMatrix([]);
      setParsedRows([]);
      return;
    }

    const lines = rawContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // Check if JSON
    if ((importPreset === "auto" || importPreset === "json") && (rawContent.trim().startsWith("[") || rawContent.trim().startsWith("{"))) {
      try {
        const parsedJson = JSON.parse(rawContent);
        const arrayData = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
        const results: ParsedImportCustomer[] = [];
        
        arrayData.forEach(item => {
          if (typeof item === "object" && item !== null) {
            results.push({
              selected: true,
              name: item.name || item.fullName || item.username || "مشترك مستورد",
              username: String(item.username || item.user || item.name || "").trim(),
              password: String(item.password || item.pass || item.secret || "123456").trim(),
              phone: item.phone || item.mobile || item.telephone || "",
              region: item.region || item.address || item.city || "",
              ipAddress: item.ipAddress || item.ip || "",
              connectionType: item.connectionType || item.type || ConnectionType.PPPOE,
              offerNameOrId: item.offerId || item.offer || item.plan || item.profile || "",
              expiryDate: item.expiryDate || item.expiry || "",
              status: item.status || CustomerStatus.ACTIVE,
              debt: Number(item.debt || 0),
              macAddress: item.macAddress || item.mac || ""
            });
          }
        });

        if (results.length > 0) {
          setParsedRows(results);
          return;
        }
      } catch (e) {
        // Fallback to text parsing
      }
    }

    // Detect delimiter
    const delimiters = [",", "\t", ";", "|"];
    let bestDelimiter = ",";
    let maxCols = 0;

    delimiters.forEach(d => {
      const count = lines[0].split(d).length;
      if (count > maxCols) {
        maxCols = count;
        bestDelimiter = d;
      }
    });

    if (maxCols >= 2) {
      // Split lines into matrix
      const matrix = lines.map(line => line.split(bestDelimiter).map(p => p.trim().replace(/^["']|["']$/g, '')));
      const headers = matrix[0].map((h, i) => h || `عمود ${i + 1}`);
      const rows = matrix.slice(1);

      setDetectedHeaders(headers);
      setRawMatrix(rows);

      const autoMap = autoDetectMapping(headers);
      setMapping(autoMap);
      processMatrixWithMapping(headers, rows, autoMap);
    } else {
      // Line by line fallback
      parseRawTextLines(lines);
    }
  };

  // Line by line parsing for FreeRADIUS, RouterOS script, or simple list
  const parseRawTextLines = (lines: string[]) => {
    const results: ParsedImportCustomer[] = [];

    lines.forEach(line => {
      // FreeRADIUS format
      if (line.includes("Cleartext-Password") || line.includes("User-Password")) {
        const match = line.match(/^([^\s]+)\s+(?:Cleartext-Password|User-Password)\s+:?=\s*["']?([^"'\s,]+)["']?/i);
        if (match) {
          results.push({
            selected: true,
            name: match[1],
            username: match[1],
            password: match[2],
            rawLine: line
          });
          return;
        }
      }

      // Mikrotik RouterOS script format
      if (line.includes("add name=") || line.includes("username=")) {
        const nameMatch = line.match(/(?:name|username)=["']?([^"'\s]+)["']?/i);
        const passMatch = line.match(/(?:password|pass|secret)=["']?([^"'\s]+)["']?/i);
        const profileMatch = line.match(/(?:profile|service)=["']?([^"'\s]+)["']?/i);
        const ipMatch = line.match(/(?:remote-address|address)=["']?([^"'\s]+)["']?/i);
        const commentMatch = line.match(/comment=["']?([^"']+)["']?/i);

        if (nameMatch) {
          const uname = nameMatch[1];
          results.push({
            selected: true,
            name: commentMatch ? commentMatch[1] : uname,
            username: uname,
            password: passMatch ? passMatch[1] : "123456",
            offerNameOrId: profileMatch ? profileMatch[1] : "",
            ipAddress: ipMatch ? ipMatch[1] : "",
            rawLine: line
          });
          return;
        }
      }

      // Simple single line text
      if (line.trim()) {
        const parts = line.split(/[:;,]/).map(p => p.trim());
        const uname = parts[0];
        if (uname) {
          results.push({
            selected: true,
            name: parts[2] || uname,
            username: uname,
            password: parts[1] || "123456",
            phone: parts[3] || "",
            rawLine: line
          });
        }
      }
    });

    setParsedRows(results);
  };

  // Download Sample Template for Excel / CSV
  const handleDownloadTemplate = (format: "excel" | "csv") => {
    const sampleData = [
      {
        "اسم المشترك": "أحمد محمود علي",
        "اسم المستخدم": "ahmed_2026",
        "كلمة المرور": "987654",
        "رقم الهاتف": "0991234567",
        "المنطقة": "حي الثورة - الشارع العام",
        "عنوان IP": "10.0.1.15",
        "نوع الاتصال": "PPPoE",
        "الباقة أو العرض": "سرعة 10 ميجا مفتوح",
        "تاريخ الانتهاء": "2026-08-25",
        "الحالة": "نشط",
        "الديون": "0"
      },
      {
        "اسم المشترك": "سامر حسن الخالد",
        "اسم المستخدم": "samer_net",
        "كلمة المرور": "123456",
        "رقم الهاتف": "0988765432",
        "المنطقة": "الفرع التجاري",
        "عنوان IP": "10.0.1.16",
        "نوع الاتصال": "Hotspot",
        "الباقة أو العرض": "سرعة 5 ميجا",
        "تاريخ الانتهاء": "2026-09-01",
        "الحالة": "نشط",
        "الديون": "15000"
      },
      {
        "اسم المشترك": "مركز الأمل البرمجي",
        "اسم المستخدم": "alamal_center",
        "كلمة المرور": "center#2026",
        "رقم الهاتف": "0933112233",
        "المنطقة": "الشارع الرئيسي",
        "عنوان IP": "10.0.1.50",
        "نوع الاتصال": "PPPoE",
        "الباقة أو العرض": "سرعة 20 ميجا فائق",
        "تاريخ الانتهاء": "2026-08-10",
        "الحالة": "منتهي",
        "الديون": "0"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    if (format === "excel") {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج المشتركين");
      XLSX.writeFile(workbook, "نموذج_استيراد_المشتركين_RADIUS.xlsx");
    } else {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob(["\uFEFF" + csvOutput], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "نموذج_استيراد_المشتركين_RADIUS.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Execute Import
  const handleConfirmImport = () => {
    const activeRows = parsedRows.filter(r => r.selected && (r.username.trim() || r.name.trim()));
    if (activeRows.length === 0) {
      alert("⚠️ يرجى تحديد مشترك واحد على الأقل للاستيراد!");
      return;
    }

    const defaultOffer = offers.find(o => o?.id === defaultOfferId) || offers[0];

    const newCustomersToInsert: Omit<Customer, "id">[] = activeRows.map(r => {
      let matchedOfferId = defaultOffer?.id || "";
      if (r.offerNameOrId) {
        const found = offers.find(o => 
          o?.id === r.offerNameOrId || 
          o.name.toLowerCase().includes(r.offerNameOrId!.toLowerCase())
        );
        if (found) matchedOfferId = found?.id;
      }

      const autoIp = r.ipAddress || (defaultConnectionType === ConnectionType.HOTSPOT 
        ? `10.0.0.${Math.floor(Math.random() * 240) + 10}`
        : `192.168.88.${Math.floor(Math.random() * 240) + 10}`);

      return {
        name: r.name || r.username,
        username: r.username,
        password: r.password || "123456",
        status: r.status || CustomerStatus.ACTIVE,
        connectionType: r.connectionType || defaultConnectionType,
        ipAddress: autoIp,
        ipAssignmentType: r.ipAddress ? "manual" : "auto",
        concurrentLogins: 1,
        offerId: matchedOfferId,
        consumptionGB: 0,
        startDate: new Date().toISOString().split("T")[0],
        expiryDate: r.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        phone: r.phone || "",
        region: r.region || "",
        debt: r.debt || 0,
        balance: 0,
        macAddress: r.macAddress || undefined,
        macBindingType: r.macAddress ? "manual" : "disabled",
        authByMac: !!r.macAddress,
        serverId: defaultServerId || undefined
      };
    });

    onImportCustomers(newCustomersToInsert, duplicateMode);
    setImportSummary(`✅ تم استيراد (${newCustomersToInsert.length}) مشترك بنجاح!`);
    
    setTimeout(() => {
      setImportSummary(null);
      setParsedRows([]);
      setImportText("");
      onClose();
    }, 1500);
  };

  // Generate Export Content
  const generateExportContent = (): string => {
    const data = exportTargetCustomers;

    switch (exportFormat) {
      case "csv": {
        const headers = ["الاسم", "اسم المستخدم", "كلمة المرور", "الهاتف", "المنطقة", "طريقة الاتصال", "العرض", "السيرفر", "الـ IP", "تاريخ البدء", "تاريخ الانتهاء", "الديون", "الحالة", "الماك"];
        const rows = data.map(c => {
          const offerName = offers.find(o => o?.id === c.offerId)?.name || "";
          const serverName = servers.find(s => s?.id === c.serverId)?.name || "";
          return [
            `"${c.name}"`,
            `"${c.username}"`,
            `"${c.password || ""}"`,
            `"${c.phone || ""}"`,
            `"${c.region || ""}"`,
            `"${c.connectionType}"`,
            `"${offerName}"`,
            `"${serverName}"`,
            `"${c.ipAddress}"`,
            `"${c.startDate || ""}"`,
            `"${c.expiryDate}"`,
            `"${c.debt || 0}"`,
            `"${c.status}"`,
            `"${c.macAddress || ""}"`
          ].join(",");
        });
        return "\uFEFF" + [headers.join(","), ...rows].join("\n");
      }

      case "json": {
        const jsonDump = data.map(c => {
          const offer = offers.find(o => o?.id === c.offerId);
          const server = servers.find(s => s?.id === c.serverId);
          return {
            id: c?.id,
            name: c.name,
            username: c.username,
            password: c.password,
            status: c.status,
            connectionType: c.connectionType,
            ipAddress: c.ipAddress,
            phone: c.phone,
            region: c.region,
            offerName: offer?.name,
            offerSpeed: offer?.speed,
            serverName: server?.name,
            startDate: c.startDate,
            expiryDate: c.expiryDate,
            debt: c.debt,
            macAddress: c.macAddress
          };
        });
        return JSON.stringify(jsonDump, null, 2);
      }

      case "freeradius_users": {
        return data.map(c => {
          const offer = offers.find(o => o?.id === c.offerId);
          const speed = offer?.speed ? offer.speed.replace(/\s*Mbps/i, "M") : "10M";
          const lines = [
            `# Customer: ${c.name} (${c.phone || "No Phone"})`,
            `${c.username} Cleartext-Password := "${c.password || "123456"}"`,
            `\tFramed-IP-Address = ${c.ipAddress},`,
            `\tMikrotik-Rate-Limit = "${speed}/${speed}",`,
            `\tSimultaneous-Use = ${c.concurrentLogins || 1},`,
            `\tReply-Message = "Welcome ${c.name} to Radius Network"`
          ];
          return lines.join("\n");
        }).join("\n\n");
      }

      case "freeradius_sql": {
        const sqlStatements: string[] = [
          "-- FreeRADIUS SQL Schema Insert Statements",
          "-- Generated by Radius Management System",
          "BEGIN TRANSACTION;\n"
        ];

        data.forEach(c => {
          const pass = c.password || "123456";
          const offer = offers.find(o => o?.id === c.offerId);
          const speed = offer?.speed ? offer.speed.replace(/\s*Mbps/i, "M") : "10M";

          sqlStatements.push(`-- User: ${c.name} (${c.username})`);
          sqlStatements.push(`INSERT INTO radcheck (username, attribute, op, value) VALUES ('${c.username}', 'Cleartext-Password', ':=', '${pass}');`);
          sqlStatements.push(`INSERT INTO radcheck (username, attribute, op, value) VALUES ('${c.username}', 'Simultaneous-Use', ':=', '${c.concurrentLogins || 1}');`);
          if (c.ipAddress && c.ipAddress !== "تلقائي") {
            sqlStatements.push(`INSERT INTO radreply (username, attribute, op, value) VALUES ('${c.username}', 'Framed-IP-Address', '=', '${c.ipAddress}');`);
          }
          sqlStatements.push(`INSERT INTO radreply (username, attribute, op, value) VALUES ('${c.username}', 'Mikrotik-Rate-Limit', '=', '${speed}/${speed}');\n`);
        });

        sqlStatements.push("COMMIT;");
        return sqlStatements.join("\n");
      }

      case "mikrotik_ppp": {
        const lines: string[] = [
          "# =====================================================",
          "# Mikrotik RouterOS - Import PPPoE Secrets",
          "# Copy and Paste into RouterOS Terminal or WinBox",
          "# =====================================================",
          "/ppp secret"
        ];

        data.forEach(c => {
          const offer = offers.find(o => o?.id === c.offerId);
          const profile = offer ? offer.name.replace(/\s+/g, "_") : "default";
          const comment = `${c.name} - ${c.phone || "NoPhone"}`;
          let cmd = `add name="${c.username}" password="${c.password || "123456"}" service=pppoe profile="${profile}" comment="${comment}"`;
          if (c.ipAddress && c.ipAddress !== "تلقائي") {
            cmd += ` remote-address=${c.ipAddress}`;
          }
          lines.push(cmd);
        });

        return lines.join("\n");
      }

      case "mikrotik_hotspot": {
        const lines: string[] = [
          "# =====================================================",
          "# Mikrotik RouterOS - Import Hotspot Users",
          "# Copy and Paste into RouterOS Terminal or WinBox",
          "# =====================================================",
          "/ip hotspot user"
        ];

        data.forEach(c => {
          const offer = offers.find(o => o?.id === c.offerId);
          const profile = offer ? offer.name.replace(/\s+/g, "_") : "default";
          const comment = `${c.name} - ${c.phone || "NoPhone"}`;
          let cmd = `add name="${c.username}" password="${c.password || "123456"}" profile="${profile}" comment="${comment}"`;
          if (c.ipAddress && c.ipAddress !== "تلقائي") {
            cmd += ` address=${c.ipAddress}`;
          }
          if (c.macAddress) {
            cmd += ` mac-address=${c.macAddress}`;
          }
          lines.push(cmd);
        });

        return lines.join("\n");
      }

      case "mikrotik_usermanager": {
        const lines: string[] = [
          "# =====================================================",
          "# Mikrotik User Manager - Import Users",
          "# =====================================================",
          "/user-manager user"
        ];

        data.forEach(c => {
          const comment = `${c.name} - ${c.phone || ""}`;
          lines.push(`add customer=admin username="${c.username}" password="${c.password || "123456"}" comment="${comment}"`);
        });

        return lines.join("\n");
      }

      case "txt_simple": {
        const sep = customTxtSeparator;
        return data.map(c => `${c.username}${sep}${c.password || "123456"}${sep}${c.name}${sep}${c.phone || ""}`).join("\n");
      }

      default:
        return "";
    }
  };

  // Download exported file
  const handleDownloadExport = () => {
    if (exportFormat === "excel") {
      const exportRows = exportTargetCustomers.map(c => {
        const offer = offers.find(o => o?.id === c.offerId);
        const server = servers.find(s => s?.id === c.serverId);
        return {
          "اسم المشترك": c.name,
          "اسم المستخدم": c.username,
          "كلمة المرور": c.password || "",
          "الهاتف": c.phone || "",
          "المنطقة": c.region || "",
          "طريقة الاتصال": c.connectionType,
          "الباقة والعرض": offer?.name || "",
          "السيرفر": server?.name || "",
          "عنوان IP": c.ipAddress,
          "تاريخ البدء": c.startDate || "",
          "تاريخ الانتهاء": c.expiryDate,
          "الديون": c.debt || 0,
          "الحالة": c.status,
          "عنوان الماك MAC": c.macAddress || ""
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "المشتركين");
      XLSX.writeFile(workbook, `تصدير_المشتركين_${new Date().toISOString().split("T")[0]}.xlsx`);
      return;
    }

    const content = generateExportContent();
    let extension = "txt";
    let mimeType = "text/plain;charset=utf-8";

    if (exportFormat === "csv") {
      extension = "csv";
      mimeType = "text/csv;charset=utf-8";
    } else if (exportFormat === "json") {
      extension = "json";
      mimeType = "application/json;charset=utf-8";
    } else if (exportFormat.startsWith("mikrotik")) {
      extension = "rsc";
    } else if (exportFormat === "freeradius_sql") {
      extension = "sql";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers_export_${new Date().toISOString().split("T")[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy export to clipboard
  const handleCopyExport = () => {
    const content = generateExportContent();
    navigator.clipboard.writeText(content);
    setCopiedFormat(true);
    setTimeout(() => setCopiedFormat(false), 2000);
  };

  // Filter parsed rows by preview search
  const filteredParsedRows = useMemo(() => {
    if (!previewSearch.trim()) return parsedRows;
    const q = previewSearch.toLowerCase();
    return parsedRows.filter(r => 
      r.name.toLowerCase().includes(q) ||
      r.username.toLowerCase().includes(q) ||
      (r.phone && r.phone.includes(q)) ||
      (r.ipAddress && r.ipAddress.includes(q)) ||
      (r.region && r.region.toLowerCase().includes(q))
    );
  }, [parsedRows, previewSearch]);

  const MAPPING_FIELDS: { key: keyof FieldMapping; label: string; icon: string; required?: boolean }[] = [
    { key: "name", label: "اسم المشترك / العميل", icon: "👤", required: true },
    { key: "username", label: "اسم المستخدم / اليوزر", icon: "🔑", required: true },
    { key: "password", label: "كلمة المرور / الباسورد", icon: "🔒" },
    { key: "phone", label: "رقم الهاتف / الواتس", icon: "📱" },
    { key: "region", label: "المنطقة / العنوان", icon: "📍" },
    { key: "ipAddress", label: "عنوان الايبي IP", icon: "🌐" },
    { key: "connectionType", label: "نوع الاتصال (PPPoE/Hotspot)", icon: "⚡" },
    { key: "offerNameOrId", label: "الباقة / السرعة / العرض", icon: "💎" },
    { key: "expiryDate", label: "تاريخ الانتهاء", icon: "📅" },
    { key: "status", label: "حالة الحساب (نشط/منتهي/موقوف)", icon: "🟢" },
    { key: "debt", label: "المبلغ / الديون والذمم", icon: "💰" },
    { key: "macAddress", label: "عنوان الماك MAC Address", icon: "💻" }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 md:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 text-indigo-400 rounded-2xl border border-indigo-500/20">
              {activeTab === "import" ? <FileSpreadsheet className="w-6 h-6" /> : <Download className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-xl flex items-center gap-2">
                استيراد وتصدير بيانات المشتركين (Linux, FreeRADIUS, RouterOS & Excel) 🐧
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                دعم كامل لأنظمة لينكس Linux (FreeRADIUS Users / SQL / RouterOS / CSV) وباقات Excel مع مطابقة الأعمدة التفاعلية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("import")}
            className={`px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-2xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === "import"
                ? "bg-white dark:bg-slate-900 text-indigo-600 border-slate-200 dark:border-slate-700 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 border-transparent"
            }`}
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            استيراد المشتركين ومطابقة الأعمدة
          </button>

          <button
            onClick={() => setActiveTab("export")}
            className={`px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-2xl transition-all flex items-center gap-2 border-t border-x ${
              activeTab === "export"
                ? "bg-white dark:bg-slate-900 text-indigo-600 border-slate-200 dark:border-slate-700 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 border-transparent"
            }`}
          >
            <Download className="w-4 h-4 text-indigo-600" />
            تصدير بيانات المشتركين (Excel / Script)
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* ====================================================== */}
          {/* TAB 1: IMPORT SUBSCRIBERS WITH COLUMN MAPPING */}
          {/* ====================================================== */}
          {activeTab === "import" && (
            <div className="space-y-6">

              {importSummary && (
                <div className="px-4 py-3 text-sm bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {importSummary}
                </div>
              )}

              {/* Step 1: Drag & Drop / File Input Box & Download Samples */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* File Drop Area */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                      1. اسحب وأسقط ملف Excel / CSV أو قم باختياره:
                    </label>

                    {/* Download Sample Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate("excel")}
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 transition-all"
                        title="تحميل نموذج جاهز للتعبئة بتنسيق Excel"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        نموذج Excel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate("csv")}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 flex items-center gap-1 transition-all"
                        title="تحميل نموذج جاهز بتنسيق CSV"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        نموذج CSV
                      </button>
                    </div>
                  </div>

                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileChange(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center min-h-[140px] ${
                      isDragging 
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]" 
                        : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40"
                    }`}
                  >
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv,.txt,.json,.rsc"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />

                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-2">
                      <FileSpreadsheet className="w-7 h-7" />
                    </div>

                    {fileName ? (
                      <div>
                        <span className="block text-sm font-black text-indigo-700 dark:text-indigo-400">{fileName}</span>
                        <span className="text-xs text-slate-400">انقر للتبديل أو اختر ملفاً آخر</span>
                      </div>
                    ) : (
                      <div>
                        <span className="block text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200">
                          اسحب الملف هنا أو انقر للتصفح من جهازك
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          يدعم جميع صيغ Excel (.xlsx, .xls)، CSV، JSON، ملفات FreeRADIUS، وسكربتات الميكروتك
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Excel Sheet selector tabs if workbook has multiple sheets */}
                  {sheetNames.length > 1 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/40 flex items-center gap-2 overflow-x-auto">
                      <Layers className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs font-black text-amber-800 dark:text-amber-300 shrink-0">اختر ورقة العمل (Sheet):</span>
                      <div className="flex gap-1.5 overflow-x-auto">
                        {sheetNames.map((sName) => (
                          <button
                            key={sName}
                            type="button"
                            onClick={() => handleSheetChange(sName)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                              activeSheet === sName
                                ? "bg-amber-600 text-white shadow-sm"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-100"
                            }`}
                          >
                            {sName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Code / Textarea Fallback Accordion */}
                  <details className="text-xs group">
                    <summary className="cursor-pointer font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 py-1">
                      <FileText className="w-3.5 h-3.5" />
                      أو لصق كود النص المباشر (FreeRADIUS / RouterOS / JSON / Text)
                    </summary>
                    <div className="mt-2">
                      <textarea
                        value={importText}
                        onChange={(e) => {
                          setImportText(e.target.value);
                          parseCsvOrTextFile(e.target.value);
                        }}
                        placeholder={`الصق النص هنا مباشرة...
أمثلة للصيغ المقبولة:
- CSV: name,username,password,phone,ip
- FreeRADIUS: user1 Cleartext-Password := "123456"
- RouterOS: /ppp secret add name="user1" password="123" profile="10M"
- Text List: user1:pass1:اسم المشترك:05000000`}
                        className="w-full h-32 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none dir-ltr"
                      />
                    </div>
                  </details>
                </div>

                {/* Import Defaults & Config Sidebar */}
                <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="block text-xs font-black text-slate-800 dark:text-slate-100 border-b pb-2 flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-indigo-600" />
                    إعدادات القواعد والخيارات الافتراضية
                  </span>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">السيرفر الافتراضي NAS:</label>
                    <select
                      value={defaultServerId}
                      onChange={(e) => setDefaultServerId(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      {servers.map(s => (
                        <option key={s?.id} value={s?.id}>{s.name} ({s.ipAddress})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">العرض والسرعة الافتراضية:</label>
                    <select
                      value={defaultOfferId}
                      onChange={(e) => setDefaultOfferId(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      {offers.map(o => (
                        <option key={o?.id} value={o?.id}>{o.name} ({o.speed})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">نوع الاتصال الافتراضي:</label>
                    <select
                      value={defaultConnectionType}
                      onChange={(e) => setDefaultConnectionType(e.target.value as ConnectionType)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value={ConnectionType.PPPOE}>برودباند PPPoE</option>
                      <option value={ConnectionType.HOTSPOT}>هوت سبوت</option>
                      <option value={ConnectionType.MIXED}>متعدد</option>
                      <option value={ConnectionType.MAC}>ماك ادريس</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">معالجة الحسابات المكررة:</label>
                    <select
                      value={duplicateMode}
                      onChange={(e) => setDuplicateMode(e.target.value as any)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="skip">تجاوز الحسابات المكررة (تجاهل)</option>
                      <option value="overwrite">تحديث واستبدال الحسابات القائمة</option>
                      <option value="append">إضافة وتوليد رمز مميز تلقائي</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: COLUMN MAPPING PANEL (مطابقة الأعمدة) */}
              {detectedHeaders.length > 0 && (
                <div className="bg-indigo-50/50 dark:bg-slate-800/90 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          2. مطابقة أعمدة الملف مع حقول النظام (Column Mapping)
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          تم التعرف على ({detectedHeaders.length}) عمود من ملفك. قم بمطابقة كل حقل مع العمود المخصص له.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const auto = autoDetectMapping(detectedHeaders);
                          setMapping(auto);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        إعادة المطابقة الآلية
                      </button>
                      <button
                        type="button"
                        onClick={() => setMapping(DEFAULT_MAPPING)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all"
                      >
                        إلغاء التعيينات
                      </button>
                    </div>
                  </div>

                  {/* Mapping Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {MAPPING_FIELDS.map((field) => {
                      const currentMappedHeader = mapping[field.key];
                      // Find first row sample value for preview
                      const headerIndex = detectedHeaders.indexOf(currentMappedHeader);
                      const sampleVal = (headerIndex !== -1 && rawMatrix[0]) ? String(rawMatrix[0][headerIndex] || "") : "";

                      return (
                        <div 
                          key={field.key} 
                          className={`p-3 rounded-2xl border transition-all ${
                            currentMappedHeader 
                              ? "bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-800 shadow-sm" 
                              : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span>{field.icon}</span>
                              <span>{field.label}</span>
                              {field.required && <span className="text-rose-500 font-mono">*</span>}
                            </label>
                            {currentMappedHeader && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.5 rounded-md font-bold">
                                ممطابق
                              </span>
                            )}
                          </div>

                          <select
                            value={currentMappedHeader}
                            onChange={(e) => {
                              setMapping(prev => ({
                                ...prev,
                                [field.key]: e.target.value
                              }));
                            }}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">-- غير محدد (افتراضي) --</option>
                            {detectedHeaders.map((header, hIdx) => (
                              <option key={hIdx} value={header}>
                                📊 {header}
                              </option>
                            ))}
                          </select>

                          {sampleVal && (
                            <span className="block text-[10px] text-slate-400 font-mono mt-1.5 truncate">
                              عينة سطر 1: <strong className="text-slate-600 dark:text-slate-300">{sampleVal}</strong>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Parsed Preview Table */}
              <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    3. معاينة وتدقيق المشتركين الناتجة ({filteredParsedRows.filter(r => r.selected).length} من أصل {parsedRows.length}):
                  </h4>

                  {parsedRows.length > 0 && (
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Search Filter Box */}
                      <div className="relative w-48">
                        <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={previewSearch}
                          onChange={(e) => setPreviewSearch(e.target.value)}
                          placeholder="تصفية وسرعة البحث..."
                          className="w-full pr-8 pl-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <button
                          type="button"
                          onClick={() => setParsedRows(prev => prev.map(r => ({ ...r, selected: true })))}
                          className="hover:text-indigo-600 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg"
                        >
                          تحديد الكل
                        </button>
                        <span>|</span>
                        <button
                          type="button"
                          onClick={() => setParsedRows(prev => prev.map(r => ({ ...r, selected: false })))}
                          className="hover:text-slate-800"
                        >
                          إلغاء التحديد
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {parsedRows.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs font-bold">
                    قم باختيار ملف Excel أو CSV أو قم بلصق الكود لمعاينة وتأكيد قائمة الحسابات قبل اعتمادها.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden table-scroll-container max-h-64">
                    <table className="w-full text-right text-xs min-w-[700px] sticky-table">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-700 dark:text-slate-200 sticky-thead">
                        <tr>
                          <th className="px-2 py-2 w-8 text-center">#</th>
                          <th className="px-3 py-2">اسم المشترك</th>
                          <th className="px-3 py-2">اسم المستخدم</th>
                          <th className="px-3 py-2">كلمة المرور</th>
                          <th className="px-3 py-2">الهاتف</th>
                          <th className="px-3 py-2">المنطقة</th>
                          <th className="px-3 py-2">الـ IP</th>
                          <th className="px-3 py-2">الباقة / العرض</th>
                          <th className="px-3 py-2">تاريخ الانتهاء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredParsedRows.map((row, idx) => (
                          <tr key={idx} className={`hover:bg-indigo-50/40 dark:hover:bg-slate-800 ${row.selected ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/40 opacity-50"}`}>
                            <td className="px-2 py-2 text-center">
                              <input 
                                type="checkbox"
                                checked={row.selected}
                                onChange={(e) => {
                                  const updated = [...parsedRows];
                                  const realIndex = parsedRows.indexOf(row);
                                  if (realIndex !== -1) {
                                    updated[realIndex].selected = e.target.checked;
                                    setParsedRows(updated);
                                  }
                                }}
                                className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-100">{row.name}</td>
                            <td className="px-3 py-2 font-mono font-black text-indigo-600 dark:text-indigo-400">{row.username}</td>
                            <td className="px-3 py-2 font-mono font-bold text-slate-600 dark:text-slate-300">{row.password || "123456"}</td>
                            <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{row.phone || "—"}</td>
                            <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{row.region || "—"}</td>
                            <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-300">{row.ipAddress || "تلقائي"}</td>
                            <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{row.offerNameOrId || "الافتراضي"}</td>
                            <td className="px-3 py-2 font-mono text-slate-500 dark:text-slate-400">{row.expiryDate || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={parsedRows.filter(r => r.selected).length === 0}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                  <Upload className="w-4 h-4" />
                  اعتماد واستيراد ({parsedRows.filter(r => r.selected).length}) مشترك إلى قاعدة البيانات
                </button>
              </div>

            </div>
          )}

          {/* ====================================================== */}
          {/* TAB 2: EXPORT SUBSCRIBERS */}
          {/* ====================================================== */}
          {activeTab === "export" && (
            <div className="space-y-6">

              {/* Export Scope Selector */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-100">1. حدد نطاق المشتركين المراد تصديرهم:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                    exportScope === "all" ? "bg-white dark:bg-slate-900 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-700 font-extrabold" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:bg-slate-800"
                  }`}>
                    <input 
                      type="radio" 
                      name="exportScope" 
                      checked={exportScope === "all"} 
                      onChange={() => setExportScope("all")}
                      className="text-indigo-600" 
                    />
                    <div>
                      <span className="block text-xs">جميع العملاء والمشتركين</span>
                      <span className="text-[10px] text-slate-400 font-mono">({customers.length} مشترك)</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                    exportScope === "filtered" ? "bg-white dark:bg-slate-900 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-700 font-extrabold" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:bg-slate-800"
                  }`}>
                    <input 
                      type="radio" 
                      name="exportScope" 
                      checked={exportScope === "filtered"} 
                      onChange={() => setExportScope("filtered")}
                      className="text-indigo-600" 
                    />
                    <div>
                      <span className="block text-xs">نتائج الفلترة والبحث الحالي</span>
                      <span className="text-[10px] text-slate-400 font-mono">({filteredCustomers.length} مشترك)</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                    exportScope === "selected" ? "bg-white dark:bg-slate-900 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-700 font-extrabold" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:bg-slate-800"
                  }`}>
                    <input 
                      type="radio" 
                      name="exportScope" 
                      checked={exportScope === "selected"} 
                      onChange={() => setExportScope("selected")}
                      className="text-indigo-600" 
                    />
                    <div>
                      <span className="block text-xs">المشتركين المحددين في الجدول</span>
                      <span className="text-[10px] text-slate-400 font-mono">({selectedCustomerIds.length} مشترك)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Export Format Selector Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-100">2. اختر صيغة التصدير المطلوبة:</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Format 1: Excel Workbook */}
                  <div 
                    onClick={() => setExportFormat("excel")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      exportFormat === "excel" ? "bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">جدول مصنف Excel (.xlsx)</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">تصدير كامل البيانات بتنسيق Excel مصنف بجميع الأعمدة والحقول التفصيلية.</p>
                    </div>
                  </div>

                  {/* Format 2: CSV */}
                  <div 
                    onClick={() => setExportFormat("csv")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      exportFormat === "csv" ? "bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">جدول CSV مع الترميز العربي UTF-8</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">مناسب لفتحه وتعديله في أي برنامج جداول بيانات بسهولة.</p>
                    </div>
                  </div>

                  {/* Format 3: FreeRADIUS Users File */}
                  <div 
                    onClick={() => setExportFormat("freeradius_users")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      exportFormat === "freeradius_users" ? "bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">تكوين ملف FreeRADIUS Users</h5>
                        <span className="text-[10px] bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-bold">Linux 🐧</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">صيغة ملف `/etc/freeradius/3.0/users` الجاهز للتطابق المباشر في خوادم لينكس.</p>
                    </div>
                  </div>

                  {/* Format 4: FreeRADIUS SQL Schema */}
                  <div 
                    onClick={() => setExportFormat("freeradius_sql")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      exportFormat === "freeradius_sql" ? "bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">أوامر FreeRADIUS SQL (radcheck & radreply)</h5>
                        <span className="text-[10px] bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded font-bold">Linux SQL 🐧</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">عبارات INSERT جاهزة للتنفيذ على قواعد بيانات MySQL/PostgreSQL لسيرفرات لينكس.</p>
                    </div>
                  </div>

                  {/* Format 5: Mikrotik RouterOS PPP Secrets */}
                  <div 
                    onClick={() => setExportFormat("mikrotik_ppp")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      exportFormat === "mikrotik_ppp" ? "bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shrink-0">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">سكربت ميكروتيك PPPoE Secrets (.rsc)</h5>
                        <span className="text-[10px] bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded font-bold">Linux RouterOS 🐧</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">كود `/ppp secret add` لإدخال الحسابات مباشرة إلى الميكروتك بدون ريديوس.</p>
                    </div>
                  </div>

                  {/* Format 6: Mikrotik RouterOS Hotspot */}
                  <div 
                    onClick={() => setExportFormat("mikrotik_hotspot")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      exportFormat === "mikrotik_hotspot" ? "bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">سكربت ميكروتيك Hotspot Users (.rsc)</h5>
                        <span className="text-[10px] bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded font-bold">Linux RouterOS 🐧</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">كود `/ip hotspot user add` لاقتطاع واستيراد مستخدمي الهوتسبوت.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Code Preview Box */}
              {exportFormat !== "excel" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-slate-800 dark:text-slate-100">3. معاينة الكود / البيانات الناتجة:</label>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      إجمالي المشتركين التابعين للتصدير: {exportTargetCustomers.length}
                    </span>
                  </div>

                  <textarea
                    readOnly
                    value={generateExportContent()}
                    className="w-full h-44 p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none leading-relaxed resize-none dir-ltr selection:bg-indigo-600 selection:text-white"
                  />
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all w-full sm:w-auto"
                >
                  إغلاق
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {exportFormat !== "excel" && (
                    <button
                      type="button"
                      onClick={handleCopyExport}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    >
                      {copiedFormat ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          تم النسخ للحافظة!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          نسخ الكود 📋
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDownloadExport}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4" />
                    تنزيل ملف التصدير 💾
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
