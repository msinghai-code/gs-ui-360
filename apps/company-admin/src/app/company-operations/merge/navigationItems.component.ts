export const navigationItems = [
    {
        name:"General",
        href:"javascripit:void(0)",
        children:[
            {
                name:"Customers",
                href:"/apex/Administration#Administration-Customers"
            },
            {
                name:"Relationships",
                href:"/apex/RelationshipConfig"
            },
            {
                name:"Person",
                href:"/apex/PersonConfig"
            },
            {
                name:"Notifications",
                href:"/apex/Administration#Administration-Notifications"
            },
            {
                name:"Product Features",
                href:"/apex/Administration#Administration-Features"
            },
            {
                name:"Account Hierarchy",
                href:"/apex/AdoptionByOpportunity"
            },
            {
                name:"Config Snapshot",
                href:"/apex/ConfigSnapshot"
            },
            {
                name:"Domains",
                href:"/apex/DashboardLayoutEditor"
            },
            {
                name:"Sites",
                href:"/apex/DashboardComponentEditor"
            },
            {
                name:"Pages",
                href:"/apex/DashboardConfiguration"
            }
        ]
    },
    {
        name:"Workflow",
        href:"javascripit:void(0)",
        children:[
            {
                name:"Calls to Action",
                href:"/apex/WorkflowConfiguration?action=CALLS_TO_ACTION"
            },
            {
                name:"Tasks",
                href:"/apex/WorkflowConfiguration?action=TASKS"
            },
            {
                name:"Playbooks",
                href:"/apex/WorkflowConfiguration?action=PLAYBOOKS"
            },
            {
                name:"Mass Edit",
                href:"/apex/WorkflowMassUpdates#newreport"
            },
            {
                name:"Success Plans",
                href:"/apex/SuccessplansConfiguration"
            },
            {
                "name":"Milestones",
                href:"/apex/Alerts"
            },
            {
                name:"Activities and Timeline",
                href:"/apex/ActivityTypesConfiguration"
            }
        ]
    },
    {
        name:"Communication",
        href:"javascripit:void(0)",
        children:[
            {
                name:"Email Configuration",
                href:"/apex/GSEmailConfig"
            },
            {
                name:"Journey Orchestrator Permissions",
                href:"/apex/CopilotModulePermissions"
            },
            {
                name:"Gsnap",
                href:"/apex/gsnapconfiguration"
            },
            {
                name:"Surveys",
                href:"/apex/Administration#Administration-NPS"
            },
            {
                name:"Languages",
                href:"/apex/SurveyDesign"
            }
            
        ]
    },
    {
        name:"Operations",
        href:"javascripit:void(0)",
        children:[
            {
                name:"MDA Services",
                href:"/apex/ApplicationSettings"
            },
            {
                name:"Application Settings",
                href:"/apex/RulesConfig"
            },
            {
                name:"Events",
                href:"/apex/Administration#Administration-EventsFramework"
            },
            {
                name:"Data Management",
                href:"/apex/com"
            },
            {
                name:"Connectors",
                href:"/apex/Integration"
            },
            {
                name:"Rules Engine",
                href:"/apex/RulesManager"
            },
            {
                name:"Usage Configuration",
                href:"/apex/usageconfiguration"
            },
            {
                name:"Migration",
                href:"/apex/migration"
            },
            {
                name:"Connectors 2.0",
                href:"/apex/UnifiedConnectors"
            },
            {
                name:"Gainsight Connect",
                href:"/apex/datasync"
            },
            {
                name:"Data Spaces",
                href:"/apex/Insights"
            },
            {
                name:"User Management",
                href:"/apex/userManagement"
            },
            {
                name:"Data Operation",
                href:"/apex/dataOperation",
                current: true
            }
        ]
    },
    {
        name:"Analytics",
        href:"javascripit:void(0)",
        children:[
            {
                name:"Report Builder",
                href:"/apex/ReportBuilder"
            },
            {
                name:"Dashboard Builder",
                href:"/apex/LayoutManager"
            },
            {
                name:"Success Snapshots",
                href:"/apex/ReportManager"
            },
            {
                name:"UI Views",
                href:"/apex/Administration#Administration-UIViews"
            },
            {
                name:"C360 Layouts",
                href:"/apex/CaseSettings"
            },
            {
                name:"Log",
                href:"/apex/Administration#AdministrationLog"
            }
            // ,
            // {
            // 	name:"Segmentation",
            // 	href:"/apex/userManagement"
            // }
        ]
    },
    {
        name:"Sharing",
        href:"javascripit:void(0)",
        children:[
            {
                name:"360 Layouts",
                href:"/apex/ExternalLayoutsConfiguration"
            },
            {
                name:"Gainsight 360",
                href:"/apex/Gainsight360"
                
            }
        ]
    },
    {
        name:"Health Scoring",
        href:"javascripit:void(0)",
        children:[
            {
                name:"Account Scorecards",
                href:"/apex/scorecardsetup"
            },
            {
                name:"Relationship Scorecards",
                href:"/apex/scorecardconfig"
            },
            {
                name:"Scorecards 2.0",
                href:"/apex/scorecardconfigV2"
            }
        ]
    },
    {
        name:"Security Controls",
        href:"javascripit:void(0)",
        children:[
            {
                name:"SFDC Sharing Settings",
                href:"/apex/Administration#Administration-SecurityControls"
            },
            {
                name:"Gainsight Sharing Settings",
                href:"/apex/Administration#Administration-GainsightPermissions"
            },
            {
                name:"Permission Groups",
                href:"/apex/PermissionGroups"
            },
            {
              name:"External Actions",
              href:"/apex/ExternalActions"
            }
        ]
    },
    {
        name:"Sally",
        href:"javascripit:void(0)",
        children:[
            {
                name:"Slack",
                href:"/apex/SallyAdministration"
            }
        ]
    },
    {
        name:"Revenue Management",
        href:"javascripit:void(0)",
        children:[
            {
                name:"LRM",
                href:"/apex/lrmconfig"
            }
            //,
            // {
            // 	name:"Transactions",
            // 	href:"/apex/Gainsight360"
            // },
            // {
            // 	name:"Opportunity Connector",
            // 	href:"/apex/Gainsight360"
            // }
        ]
    }
    
];
