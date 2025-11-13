/**
 * Tool Definition Examples - Following Claude Best Practices
 *
 * This file demonstrates proper tool definitions for each agent type
 * following Claude's tool use implementation guidelines.
 */

// ============================================================================
// DEVOPS AGENT TOOLS
// ============================================================================

const devopsTools = [
  {
    name: "deploy_application",
    description: `Deploys an application to a specified environment using the configured CI/CD pipeline.

    Use this tool when deploying applications to development, staging, or production environments. The tool triggers the deployment pipeline, monitors progress, and returns deployment status with version information.

    The deployment process includes building the application, running tests, creating container images, and deploying to the target environment. Deployments to production require additional validation and may take 10-15 minutes. Staging and development deployments typically complete in 5-7 minutes.

    Do not use this tool for rollbacks (use rollback_deployment instead) or for checking deployment status (use get_deployment_status instead).`,
    input_schema: {
      type: "object",
      properties: {
        application_name: {
          type: "string",
          description: "Name of the application to deploy. Must match an application registered in the deployment system (e.g., 'api-server', 'web-frontend', 'worker-service')."
        },
        environment: {
          type: "string",
          enum: ["development", "staging", "production"],
          description: "Target environment for deployment. 'production' requires approval and additional validation. 'staging' mirrors production configuration. 'development' uses minimal resources."
        },
        version: {
          type: "string",
          description: "Version tag or git commit SHA to deploy. Use semantic versioning format (e.g., 'v1.2.3') or 7+ character git SHA. Use 'latest' to deploy the most recent build from the main branch."
        },
        force: {
          type: "boolean",
          description: "Skip pre-deployment validation checks. Only use when explicitly requested or when validation checks are blocking a known-good deployment. Default: false."
        }
      },
      required: ["application_name", "environment", "version"]
    }
  },

  {
    name: "check_kubernetes_cluster_health",
    description: `Retrieves health status and metrics for a Kubernetes cluster including node status, pod health, resource utilization, and running services.

    Use this tool when investigating cluster issues, monitoring overall cluster health, or preparing capacity planning reports. Returns comprehensive cluster metrics including CPU/memory usage across nodes, pod distribution, failing pods, and service endpoint status.

    The health check examines all namespaces by default but can be filtered to specific namespaces. Results include node conditions (Ready, MemoryPressure, DiskPressure), pod phases (Running, Pending, Failed), and resource requests vs. limits.

    For detailed pod logs or specific deployment status, use get_pod_logs or describe_deployment instead. This tool provides cluster-wide overview, not individual resource details.`,
    input_schema: {
      type: "object",
      properties: {
        cluster_name: {
          type: "string",
          description: "Name of the Kubernetes cluster to check. Must be one of the configured clusters (e.g., 'prod-us-east', 'staging-eu-west', 'dev-local')."
        },
        namespace: {
          type: "string",
          description: "Optional namespace to filter results. If not specified, checks all namespaces. Use 'default', 'kube-system', or application-specific namespaces."
        },
        include_metrics: {
          type: "boolean",
          description: "Include detailed CPU and memory metrics for nodes and pods. Adds 2-3 seconds to query time. Default: true."
        }
      },
      required: ["cluster_name"]
    }
  },

  {
    name: "execute_ansible_playbook",
    description: `Executes an Ansible playbook against specified hosts for configuration management and automation tasks.

    Use this tool for infrastructure configuration, software installation, service management, and automated system administration tasks across multiple hosts. The tool runs Ansible playbooks with proper inventory management, variable injection, and error handling.

    Playbooks are executed remotely via SSH with sudo privileges where required. The tool streams execution output and returns a summary of changed, failed, and ok tasks per host. Long-running playbooks (>5 minutes) provide progress updates every 30 seconds.

    For ad-hoc commands on single hosts, use execute_command instead. For Docker/Kubernetes deployments, use deploy_application instead. This tool is specifically for Ansible-based configuration management.`,
    input_schema: {
      type: "object",
      properties: {
        playbook_path: {
          type: "string",
          description: "Path to the Ansible playbook YAML file relative to the playbooks directory (e.g., 'web-servers/setup.yml', 'database/backup.yml'). Playbook must exist in the repository."
        },
        target_hosts: {
          type: "string",
          description: "Ansible inventory pattern specifying target hosts (e.g., 'webservers', 'db-master', 'all', '192.168.1.*'). Can be group names from inventory or host patterns."
        },
        extra_vars: {
          type: "object",
          description: "Additional variables to pass to the playbook as key-value pairs. These override variables defined in the playbook or inventory. Example: {\"app_version\": \"1.2.3\", \"enable_monitoring\": true}"
        },
        check_mode: {
          type: "boolean",
          description: "Run playbook in check mode (dry-run) without making actual changes. Useful for validating playbooks before execution. Default: false."
        },
        tags: {
          type: "string",
          description: "Comma-separated list of tags to run specific tasks (e.g., 'configuration,restart'). Only tasks with matching tags will execute."
        }
      },
      required: ["playbook_path", "target_hosts"]
    }
  }
];

// ============================================================================
// SECURITY AGENT TOOLS
// ============================================================================

const securityTools = [
  {
    name: "scan_network_ports",
    description: `Performs authorized network port scanning on specified hosts to identify open ports, running services, and potential security vulnerabilities.

    Use this tool ONLY on systems you own or have explicit written authorization to test. The tool performs TCP SYN scans, service version detection, and OS fingerprinting based on scan configuration. Results include open ports, service banners, version information, and identified vulnerabilities.

    Scans can range from quick common port checks (1-3 minutes) to comprehensive all-port scans (10-20 minutes depending on target responsiveness). The tool implements rate limiting to avoid overwhelming target systems and includes timeout handling for unresponsive hosts.

    CRITICAL: Only use on authorized systems. Unauthorized port scanning may violate computer fraud and abuse laws. Document all scanning activities in audit logs. For vulnerability assessment beyond port scanning, use run_vulnerability_scan instead.`,
    input_schema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Target IP address, hostname, or CIDR range to scan (e.g., '192.168.1.1', 'example.com', '10.0.0.0/24'). Multiple targets can be comma-separated."
        },
        port_range: {
          type: "string",
          description: "Port range to scan. Common options: 'common' (top 1000 ports), 'all' (1-65535), or custom range (e.g., '80,443,8080-8090'). Default: 'common'."
        },
        scan_type: {
          type: "string",
          enum: ["syn", "connect", "service_version", "aggressive"],
          description: "Scan type: 'syn' (fast SYN scan, requires root), 'connect' (full TCP connect), 'service_version' (includes version detection), 'aggressive' (includes OS detection and scripts). Default: 'syn'."
        },
        timeout: {
          type: "number",
          description: "Timeout in seconds for each port probe. Lower values speed up scans but may miss slow-responding services. Range: 1-30. Default: 5."
        }
      },
      required: ["target"]
    }
  },

  {
    name: "analyze_security_logs",
    description: `Analyzes security logs (authentication, firewall, IDS/IPS) to identify suspicious activities, failed login attempts, potential intrusions, and security policy violations.

    Use this tool for security incident investigation, threat hunting, compliance auditing, and routine security monitoring. The tool parses logs from various sources (syslog, auth.log, firewall logs, WAF logs), correlates events, and identifies patterns indicating security issues.

    Analysis includes: failed authentication attempts (especially brute force patterns), privilege escalation attempts, unauthorized access attempts, port scans, malware signatures, policy violations, and anomalous user behavior. Results are prioritized by severity (Critical, High, Medium, Low, Info).

    For log searches can process up to 30 days of historical logs but queries spanning more than 7 days may take 30-60 seconds. Use specific time ranges and filters to improve performance. For real-time monitoring, use monitor_security_events instead.`,
    input_schema: {
      type: "object",
      properties: {
        log_source: {
          type: "string",
          enum: ["auth", "firewall", "ids", "waf", "all"],
          description: "Log source to analyze: 'auth' (authentication logs), 'firewall' (firewall deny logs), 'ids' (intrusion detection), 'waf' (web application firewall), 'all' (all sources, takes longer)."
        },
        time_range: {
          type: "string",
          description: "Time range for analysis in format 'Xh' (hours), 'Xd' (days), or 'YYYY-MM-DD HH:MM to YYYY-MM-DD HH:MM'. Examples: '24h', '7d', '2024-01-01 00:00 to 2024-01-07 23:59'. Max: 30 days."
        },
        filter_pattern: {
          type: "string",
          description: "Optional regex pattern to filter log entries. Use to focus on specific IPs, users, or patterns (e.g., '192\\.168\\.1\\..*', 'user=admin', 'failed|error'). Case-insensitive."
        },
        severity_threshold: {
          type: "string",
          enum: ["critical", "high", "medium", "low", "info"],
          description: "Minimum severity level to include in results. 'critical' shows only critical issues, 'low' includes low and above. Default: 'medium'."
        },
        include_false_positives: {
          type: "boolean",
          description: "Include events likely to be false positives (e.g., known scanners, monitoring systems). Useful for tuning detection rules. Default: false."
        }
      },
      required: ["log_source", "time_range"]
    }
  },

  {
    name: "check_certificate_expiration",
    description: `Checks SSL/TLS certificate expiration dates for specified domains and alerts on certificates expiring within a threshold period.

    Use this tool for certificate management, proactive renewal planning, and avoiding service outages due to expired certificates. The tool connects to HTTPS endpoints, retrieves certificate chains, validates certificates, and reports expiration dates with days remaining.

    Checks include: certificate expiration date, issuer information, certificate chain validity, subject alternative names (SANs), signature algorithm strength, and common certificate issues (self-signed, untrusted CA, name mismatch).

    Results indicate status: 'valid' (>30 days remaining), 'warning' (7-30 days), 'critical' (<7 days), 'expired'. The tool supports SNI (Server Name Indication) for virtual hosted sites and can check certificates on non-standard ports. Average check time: 2-3 seconds per domain.`,
    input_schema: {
      type: "object",
      properties: {
        domains: {
          type: "array",
          items: { type: "string" },
          description: "Array of domain names to check. Can include subdomains and ports (e.g., ['example.com', 'api.example.com', 'secure.example.com:8443']). HTTPS port 443 assumed if not specified."
        },
        warning_days: {
          type: "number",
          description: "Number of days before expiration to trigger warning status. Certificates expiring within this window are flagged for renewal. Range: 1-365. Default: 30."
        },
        include_chain: {
          type: "boolean",
          description: "Include full certificate chain analysis (intermediate and root certificates). Adds 1-2 seconds per domain. Default: false."
        },
        check_revocation: {
          type: "boolean",
          description: "Check certificate revocation status via OCSP/CRL. Adds 2-4 seconds per domain and may fail if OCSP responder is unavailable. Default: false."
        }
      },
      required: ["domains"]
    }
  }
];

// ============================================================================
// CLOUD AGENT TOOLS
// ============================================================================

const cloudTools = [
  {
    name: "provision_aws_ec2_instance",
    description: `Provisions a new AWS EC2 instance with specified configuration including instance type, AMI, security groups, and storage.

    Use this tool for creating virtual servers in AWS for applications, testing, or temporary workloads. The tool handles instance provisioning, security group configuration, key pair management, EBS volume attachment, and tags. Returns instance ID, public/private IP addresses, and connection information.

    Provisioning typically takes 2-4 minutes for the instance to reach 'running' state. The tool waits for status checks to pass before returning. Instances are automatically tagged with creation timestamp, creator, and purpose for cost tracking and resource management.

    For production workloads, consider using auto-scaling groups instead (use create_autoscaling_group). For containerized applications, use ECS/EKS deployment tools. This tool creates standalone EC2 instances. Instances incur hourly charges from provisioning until termination.`,
    input_schema: {
      type: "object",
      properties: {
        instance_type: {
          type: "string",
          description: "AWS instance type determining CPU, memory, and network performance (e.g., 't3.micro', 'm5.large', 'c5.xlarge'). See AWS pricing for costs. Free tier: 't2.micro' or 't3.micro'."
        },
        ami_id: {
          type: "string",
          description: "AMI ID for the operating system image (e.g., 'ami-0123456789abcdef0'). Must be valid in the target region. Common: Amazon Linux 2, Ubuntu 20.04/22.04, Windows Server. Use 'latest-amazon-linux-2' for most recent AL2."
        },
        region: {
          type: "string",
          description: "AWS region for instance placement (e.g., 'us-east-1', 'eu-west-1', 'ap-southeast-2'). Choose region closest to users for lower latency. Check service availability."
        },
        key_pair_name: {
          type: "string",
          description: "Name of existing EC2 key pair for SSH/RDP access. Key pair must exist in the specified region. Required for Linux instances. For Windows, used to decrypt administrator password."
        },
        security_group_ids: {
          type: "array",
          items: { type: "string" },
          description: "Array of security group IDs controlling network access (e.g., ['sg-0123456789abcdef0']). Groups must exist in the same VPC. Ensure rules allow required ports (22 for SSH, 3389 for RDP, 80/443 for web)."
        },
        subnet_id: {
          type: "string",
          description: "Subnet ID for instance placement within VPC (e.g., 'subnet-0123456789abcdef0'). Determines availability zone and whether instance gets public IP. Use public subnet for internet-accessible instances."
        },
        root_volume_size: {
          type: "number",
          description: "Root EBS volume size in GB. Minimum: 8 GB (varies by AMI). Recommended: 20+ GB for applications. Maximum: 16,384 GB. Larger volumes incur additional storage costs."
        },
        user_data: {
          type: "string",
          description: "Optional cloud-init script or PowerShell commands to run at instance launch. Used for software installation, configuration, or startup tasks. Base64 encoding handled automatically. Max 16 KB."
        },
        tags: {
          type: "object",
          description: "Key-value pairs for resource tagging (e.g., {\"Name\": \"web-server-01\", \"Environment\": \"production\", \"Owner\": \"team-backend\"}). Tags aid in cost allocation and resource management."
        }
      },
      required: ["instance_type", "ami_id", "region", "key_pair_name"]
    }
  },

  {
    name: "list_cloud_resources",
    description: `Lists and inventories cloud resources across AWS, Azure, or GCP including compute instances, storage, databases, and networking resources.

    Use this tool for resource discovery, cost analysis, compliance auditing, or identifying unused resources. The tool queries cloud provider APIs to enumerate resources with filtering by region, tags, resource type, and status. Returns comprehensive resource inventory with metadata.

    Resource types include: compute (EC2, VMs, GCE), storage (S3, Blob, Cloud Storage), databases (RDS, SQL Database, Cloud SQL), networking (VPCs, Virtual Networks, Load Balancers), and more. Results include resource IDs, names, configuration, creation date, and current status.

    For AWS, queries up to 16 regions concurrently. For multi-region inventories, expect 10-20 seconds query time. Single-region queries complete in 2-5 seconds. Use filters to improve performance. For detailed resource configuration, use describe_cloud_resource with specific resource ID.`,
    input_schema: {
      type: "object",
      properties: {
        provider: {
          type: "string",
          enum: ["aws", "azure", "gcp"],
          description: "Cloud provider to query: 'aws' (Amazon Web Services), 'azure' (Microsoft Azure), 'gcp' (Google Cloud Platform). Must have valid credentials configured."
        },
        resource_types: {
          type: "array",
          items: { type: "string" },
          description: "Array of resource types to list. AWS: ['ec2', 's3', 'rds', 'lambda', 'vpc']. Azure: ['vm', 'storage', 'sql', 'function', 'vnet']. GCP: ['compute', 'storage', 'sql', 'function', 'vpc']. Omit for all types."
        },
        regions: {
          type: "array",
          items: { type: "string" },
          description: "Array of regions to query (e.g., ['us-east-1', 'us-west-2']). Use 'all' for all regions (slower). Omit for default region. Region names vary by provider."
        },
        tags: {
          type: "object",
          description: "Filter resources by tags (e.g., {\"Environment\": \"production\", \"Owner\": \"team-backend\"}). Only resources with ALL specified tags are returned. Case-sensitive."
        },
        status: {
          type: "string",
          enum: ["running", "stopped", "terminated", "all"],
          description: "Filter compute resources by status. 'running' shows only active instances, 'all' includes all statuses. Applies to compute instances only. Default: 'all'."
        },
        include_cost: {
          type: "boolean",
          description: "Include estimated monthly cost for each resource based on current usage and pricing. Adds 3-5 seconds to query. Requires cost explorer permissions. Default: false."
        }
      },
      required: ["provider"]
    }
  }
];

// ============================================================================
// DATA AGENT TOOLS
// ============================================================================

const dataTools = [
  {
    name: "execute_sql_query",
    description: `Executes SQL queries against specified databases for data retrieval, analysis, or reporting purposes. Supports PostgreSQL, MySQL, and SQL Server.

    Use this tool for ad-hoc data queries, generating reports, data validation, or investigating data issues. The tool connects to databases using configured credentials, executes queries with timeout protection, and returns results in structured format (JSON array of objects).

    Queries are executed as read-only by default for safety. Write operations (INSERT, UPDATE, DELETE) require explicit enable_write permission and are subject to additional validation. Complex queries or large result sets may take up to 60 seconds. Results are limited to 10,000 rows by default to prevent memory issues.

    For data modifications, use execute_data_migration. For large data exports, use export_data_to_file. For scheduled queries, set up database jobs rather than using this tool repeatedly. Query execution is logged for audit purposes.`,
    input_schema: {
      type: "object",
      properties: {
        database_name: {
          type: "string",
          description: "Name of the configured database connection to use (e.g., 'production-db', 'analytics-warehouse', 'reporting-replica'). Connection must be pre-configured with credentials and host information."
        },
        query: {
          type: "string",
          description: "SQL query to execute. Use parameterized queries when including user input to prevent SQL injection. Multi-statement queries are supported (semicolon-separated) if enable_write is true. Comments are allowed."
        },
        parameters: {
          type: "object",
          description: "Parameters for parameterized queries as key-value pairs (e.g., {\"user_id\": 12345, \"start_date\": \"2024-01-01\"}). Parameters are safely escaped to prevent SQL injection. Use :param_name or $1, $2 syntax in query."
        },
        timeout: {
          type: "number",
          description: "Query timeout in seconds. Long-running queries are terminated after this duration. Range: 1-300 seconds. Default: 30. Use higher values for complex analytical queries."
        },
        max_rows: {
          type: "number",
          description: "Maximum number of rows to return. Protects against accidentally returning millions of rows. Range: 1-100000. Default: 10000. Use LIMIT clause in query for better performance."
        },
        enable_write: {
          type: "boolean",
          description: "Allow write operations (INSERT, UPDATE, DELETE, CREATE, DROP). Requires explicit permission. Write queries are logged and may require approval. Default: false (read-only)."
        },
        format: {
          type: "string",
          enum: ["json", "csv", "table"],
          description: "Output format: 'json' (array of objects), 'csv' (comma-separated values), 'table' (formatted text table). Default: 'json'."
        }
      },
      required: ["database_name", "query"]
    }
  },

  {
    name: "generate_data_report",
    description: `Generates comprehensive data reports with visualizations, statistics, and insights from specified data sources.

    Use this tool for business intelligence, performance reporting, trend analysis, or executive summaries. The tool queries data sources, performs statistical analysis, generates visualizations (charts, graphs), and produces formatted reports in PDF or HTML format.

    Reports can include: time-series trends, distribution charts, comparison tables, key performance indicators (KPIs), statistical summaries (mean, median, percentiles), and data quality metrics. The tool supports multiple data sources and can combine data from databases, APIs, and files.

    Report generation typically takes 30-90 seconds depending on data volume and complexity. Large datasets (>1M rows) or complex visualizations may take up to 5 minutes. Reports are cached for 1 hour for identical requests. For real-time dashboards, use create_dashboard instead.`,
    input_schema: {
      type: "object",
      properties: {
        report_type: {
          type: "string",
          enum: ["sales", "usage", "performance", "quality", "custom"],
          description: "Type of report template to use: 'sales' (revenue/transactions), 'usage' (user activity/engagement), 'performance' (system metrics), 'quality' (data quality metrics), 'custom' (define custom metrics)."
        },
        data_source: {
          type: "string",
          description: "Data source identifier for report data (e.g., 'analytics-db', 'sales-warehouse', 'api-metrics'). Must be a configured data source with appropriate permissions."
        },
        time_period: {
          type: "string",
          description: "Time period for report data. Formats: 'last_7_days', 'last_30_days', 'last_quarter', 'ytd' (year to date), or custom range 'YYYY-MM-DD to YYYY-MM-DD'. Defaults to last 30 days."
        },
        metrics: {
          type: "array",
          items: { type: "string" },
          description: "Array of metrics to include in report (e.g., ['total_revenue', 'active_users', 'conversion_rate', 'avg_response_time']). Available metrics depend on report_type. Required for 'custom' type."
        },
        dimensions: {
          type: "array",
          items: { type: "string" },
          description: "Dimensions for data grouping/segmentation (e.g., ['region', 'product_category', 'user_segment']). Creates breakdowns and comparisons in report. Max 3 dimensions for readability."
        },
        format: {
          type: "string",
          enum: ["pdf", "html", "json"],
          description: "Output format: 'pdf' (printable document), 'html' (interactive web report), 'json' (data only for custom visualization). Default: 'pdf'."
        },
        include_visualizations: {
          type: "boolean",
          description: "Include charts and graphs in report (line charts, bar charts, pie charts). Visualizations are automatically selected based on data type. Default: true."
        }
      },
      required: ["report_type", "data_source"]
    }
  }
];

// ============================================================================
// SYSTEM AGENT TOOLS
// ============================================================================

const systemTools = [
  {
    name: "monitor_system_resources",
    description: `Monitors system resource utilization including CPU, memory, disk, and network usage across specified hosts or clusters.

    Use this tool for performance monitoring, capacity planning, troubleshooting resource bottlenecks, or identifying resource-intensive processes. The tool collects real-time metrics from system monitoring agents, performs threshold checks, and identifies anomalies.

    Monitoring includes: CPU usage (per core and aggregate), memory utilization (used/available/cached), disk I/O (read/write IOPS and throughput), network traffic (bandwidth usage, packet rates, errors), and process-level resource consumption (top consumers by CPU/memory).

    Results indicate status: 'normal' (within thresholds), 'warning' (approaching limits), 'critical' (exceeded limits). Historical data for the past hour is included for trend analysis. For longer-term monitoring, use create_monitoring_dashboard. Real-time data is updated every 10 seconds.`,
    input_schema: {
      type: "object",
      properties: {
        hosts: {
          type: "array",
          items: { type: "string" },
          description: "Array of hostnames or IP addresses to monitor (e.g., ['web-01.example.com', '192.168.1.10']). Use 'all' to monitor all configured hosts. Max 50 hosts per request."
        },
        metrics: {
          type: "array",
          items: { type: "string" },
          description: "Metrics to collect: ['cpu', 'memory', 'disk', 'network', 'processes']. Omit to collect all metrics. Selecting fewer metrics improves response time."
        },
        duration: {
          type: "number",
          description: "Duration in seconds to monitor. Tool will collect metrics for this period and return averages and peaks. Range: 10-3600 seconds. Default: 60 (1 minute)."
        },
        thresholds: {
          type: "object",
          description: "Custom threshold values for alerts (e.g., {\"cpu_warning\": 70, \"cpu_critical\": 90, \"memory_warning\": 80, \"memory_critical\": 95}). Values are percentages. Uses system defaults if not specified."
        },
        include_processes: {
          type: "boolean",
          description: "Include top 10 resource-consuming processes per host with CPU/memory usage and command lines. Useful for identifying resource hogs. Default: true."
        }
      },
      required: ["hosts"]
    }
  },

  {
    name: "manage_system_service",
    description: `Manages system services (start, stop, restart, enable, disable) across Linux (systemd/init) and Windows (Service Control Manager) hosts.

    Use this tool for service lifecycle management, applying configuration changes that require restarts, troubleshooting service failures, or enabling/disabling services. The tool executes service management commands remotely via SSH (Linux) or WinRM (Windows) with appropriate privileges.

    Operations include: 'start' (start stopped service), 'stop' (stop running service), 'restart' (stop and start), 'reload' (reload config without restart if supported), 'enable' (start on boot), 'disable' (don't start on boot), 'status' (check current state).

    Service operations typically complete in 2-10 seconds depending on service startup/shutdown complexity. Some services (databases, application servers) may take 30-60 seconds to start fully. The tool waits for state changes to complete and verifies final status. Failed operations return error details from service logs.`,
    input_schema: {
      type: "object",
      properties: {
        hosts: {
          type: "array",
          items: { type: "string" },
          description: "Array of hostnames/IPs where service management should be performed (e.g., ['web-01', 'web-02', 'db-master']). Commands execute in parallel across hosts."
        },
        service_name: {
          type: "string",
          description: "Name of the service to manage. Linux: systemd unit name (e.g., 'nginx', 'postgresql', 'myapp.service'). Windows: service name (e.g., 'W3SVC', 'MSSQLSERVER'). Case-sensitive on Linux."
        },
        action: {
          type: "string",
          enum: ["start", "stop", "restart", "reload", "enable", "disable", "status"],
          description: "Action to perform: 'start' (start service), 'stop' (stop service), 'restart' (stop then start), 'reload' (reload config), 'enable' (auto-start on boot), 'disable' (no auto-start), 'status' (check state)."
        },
        wait_for_start: {
          type: "boolean",
          description: "For start/restart actions, wait for service to fully start and pass health checks before returning. Increases operation time but ensures service is ready. Default: true."
        },
        timeout: {
          type: "number",
          description: "Timeout in seconds for service operation. If service doesn't complete action within this time, operation fails. Range: 5-300 seconds. Default: 30."
        },
        force: {
          type: "boolean",
          description: "Force operation even if service is in unexpected state (e.g., force-stop unresponsive service). Use with caution as this may cause data loss for some services. Default: false."
        }
      },
      required: ["hosts", "service_name", "action"]
    }
  }
];

// ============================================================================
// CODE AGENT TOOLS
// ============================================================================

const codeTools = [
  {
    name: "analyze_code_quality",
    description: `Analyzes source code for quality issues, code smells, complexity metrics, and adherence to coding standards using static analysis tools.

    Use this tool for code reviews, identifying technical debt, ensuring code quality standards, or preparing for refactoring. The tool runs linters, complexity analyzers, and style checkers appropriate for the programming language, then aggregates results with severity ratings.

    Analysis includes: code complexity (cyclomatic complexity, cognitive complexity), code style violations, potential bugs, security vulnerabilities, code duplication, maintainability index, test coverage gaps, and dependency issues. Results categorize issues by severity: critical, high, medium, low, info.

    Supports multiple languages: JavaScript/TypeScript (ESLint, TSLint), Python (Pylint, Flake8), Java (Checkstyle, PMD), C# (ReSharper, FxCop), Go (golint, staticcheck), Ruby (RuboCop), PHP (PHPCS). Analysis of large codebases (>10,000 files) may take 2-5 minutes.`,
    input_schema: {
      type: "object",
      properties: {
        repository_path: {
          type: "string",
          description: "Path to source code repository or directory to analyze. Can be local path, Git repository URL, or repository identifier (e.g., './my-project', 'github.com/user/repo', 'project-repo-id')."
        },
        language: {
          type: "string",
          enum: ["javascript", "typescript", "python", "java", "csharp", "go", "ruby", "php", "auto"],
          description: "Programming language of the code. 'auto' attempts to detect language from file extensions. Detection may be inaccurate for multi-language repositories."
        },
        analysis_types: {
          type: "array",
          items: { type: "string" },
          description: "Types of analysis to perform: ['style', 'complexity', 'bugs', 'security', 'duplication', 'coverage']. Omit to run all analyses. Fewer analyses complete faster."
        },
        severity_threshold: {
          type: "string",
          enum: ["critical", "high", "medium", "low", "info"],
          description: "Minimum severity level to report. 'critical' shows only critical issues, 'info' shows all. Use higher thresholds to focus on important issues. Default: 'medium'."
        },
        config_file: {
          type: "string",
          description: "Path to custom linter/analyzer configuration file relative to repository root (e.g., '.eslintrc.json', 'pylint.rc'). If not specified, uses default rules for the language."
        },
        excluded_paths: {
          type: "array",
          items: { type: "string" },
          description: "Array of paths/patterns to exclude from analysis (e.g., ['node_modules', 'dist', '*.test.js', 'vendor']). Reduces noise from generated code and dependencies."
        },
        include_metrics: {
          type: "boolean",
          description: "Include detailed code metrics (lines of code, comment ratio, average complexity, maintainability index). Adds 10-20 seconds to analysis time. Default: true."
        }
      },
      required: ["repository_path"]
    }
  },

  {
    name: "run_test_suite",
    description: `Executes automated test suites including unit tests, integration tests, and end-to-end tests with coverage reporting and failure analysis.

    Use this tool for continuous integration, pre-deployment validation, regression testing, or test-driven development workflows. The tool detects test frameworks, executes tests with appropriate runners, collects results, and generates coverage reports.

    Supports multiple test frameworks: Jest/Mocha (JavaScript), pytest/unittest (Python), JUnit/TestNG (Java), NUnit/xUnit (C#), Go test (Go), RSpec (Ruby), PHPUnit (PHP). Tests run in isolated environments with proper setup/teardown. Failed tests include stack traces and assertion details.

    Test execution time varies: unit tests (1-5 minutes for typical projects), integration tests (5-15 minutes), E2E tests (10-30 minutes). Large test suites can be parallelized. Coverage reports show line, branch, and function coverage percentages. Failed tests are retried once to reduce flaky test false positives.`,
    input_schema: {
      type: "object",
      properties: {
        repository_path: {
          type: "string",
          description: "Path to source code repository containing tests. Can be local path, Git URL, or repository identifier. Tests must be in standard locations (e.g., './tests', './test', './spec')."
        },
        test_type: {
          type: "string",
          enum: ["unit", "integration", "e2e", "all"],
          description: "Type of tests to run: 'unit' (fast, isolated tests), 'integration' (tests with external dependencies), 'e2e' (full application tests), 'all' (runs all test types sequentially)."
        },
        test_pattern: {
          type: "string",
          description: "Pattern to select specific tests (e.g., 'user*.test.js', 'test_auth*.py', 'TestUserController'). Runs only matching tests. Omit to run all tests. Supports glob patterns and regex."
        },
        framework: {
          type: "string",
          description: "Test framework to use (e.g., 'jest', 'pytest', 'junit', 'nunit'). 'auto' attempts to detect framework from config files and dependencies. May be inaccurate for multi-framework projects."
        },
        parallel: {
          type: "boolean",
          description: "Run tests in parallel using multiple CPU cores. Significantly faster for large test suites but may cause issues with shared resources. Default: true for unit tests, false for integration/E2E."
        },
        coverage: {
          type: "boolean",
          description: "Generate code coverage report showing which lines/branches are tested. Adds 20-30% to execution time. Coverage report includes line, branch, and function coverage percentages. Default: true."
        },
        coverage_threshold: {
          type: "number",
          description: "Minimum coverage percentage required to pass (0-100). If coverage is below threshold, returns failure. Use for enforcing coverage standards. Default: no threshold check."
        },
        retry_failed: {
          type: "boolean",
          description: "Automatically retry failed tests once to reduce false negatives from flaky tests. Increases execution time but improves reliability. Default: true."
        },
        timeout: {
          type: "number",
          description: "Maximum time in seconds for entire test suite. Useful for preventing hung tests from blocking CI. Range: 60-7200 seconds. Default: 1800 (30 minutes)."
        }
      },
      required: ["repository_path"]
    }
  }
];

// ============================================================================
// EXPORT ALL TOOLS
// ============================================================================

module.exports = {
  devopsTools,
  securityTools,
  cloudTools,
  dataTools,
  systemTools,
  codeTools,

  // Combined array of all tools
  allTools: [
    ...devopsTools,
    ...securityTools,
    ...cloudTools,
    ...dataTools,
    ...systemTools,
    ...codeTools
  ],

  // Helper function to get tools by agent type
  getToolsByAgent: function(agentType) {
    const toolMap = {
      devops: devopsTools,
      security: securityTools,
      cloud: cloudTools,
      data: dataTools,
      system: systemTools,
      code: codeTools
    };
    return toolMap[agentType] || [];
  },

  // Helper function to validate tool definition
  validateToolDefinition: function(tool) {
    const errors = [];

    // Check required fields
    if (!tool.name) errors.push('Tool must have a name');
    if (!tool.description) errors.push('Tool must have a description');
    if (!tool.input_schema) errors.push('Tool must have an input_schema');

    // Validate name format
    if (tool.name && !/^[a-zA-Z0-9_-]{1,64}$/.test(tool.name)) {
      errors.push('Tool name must match ^[a-zA-Z0-9_-]{1,64}$');
    }

    // Check description length
    if (tool.description && tool.description.length < 100) {
      errors.push(`Tool description is short (${tool.description.length} chars). Recommend 3-4 sentences minimum (200+ chars).`);
    }

    // Validate input schema
    if (tool.input_schema) {
      if (tool.input_schema.type !== 'object') {
        errors.push('input_schema type must be "object"');
      }
      if (!tool.input_schema.properties) {
        errors.push('input_schema must have properties');
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
};
