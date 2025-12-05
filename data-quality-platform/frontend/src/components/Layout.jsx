import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Divider,
  Avatar,
  Chip
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  UploadFile as UploadIcon,
  TableChart as TableIcon,
  Assessment as AssessmentIcon,
  BugReport as BugIcon,
  Notifications as NotificationsIcon,
  DataObject as DataIcon,
  CompareArrows as CompareIcon
} from '@mui/icons-material'

const drawerWidth = 280

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', color: '#667eea' },
  { text: 'Upload Data', icon: <UploadIcon />, path: '/upload', color: '#f093fb' },
  { text: 'Tables', icon: <TableIcon />, path: '/tables', color: '#4facfe' },
  { text: 'Quality', icon: <AssessmentIcon />, path: '/quality', color: '#43e97b' },
  { text: 'Issues', icon: <BugIcon />, path: '/issues', color: '#fa709a' },
  { text: 'Monitoring', icon: <NotificationsIcon />, path: '/monitoring', color: '#fee140' },
  { text: 'Comparison', icon: <CompareIcon />, path: '/comparison', color: '#9c27b0' }
]

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <Box sx={{ 
      height: '100%',
      background: '#ffffff',
      borderRight: '1px solid #e0e0e0'
    }}>
      {/* Logo Section */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center',
        background: '#fafafa',
        borderBottom: '1px solid #e0e0e0',
        mb: 2
      }}>
        <Avatar
          sx={{
            width: 50,
            height: 50,
            margin: '0 auto 12px',
            background: '#424242',
            border: '1px solid #e0e0e0'
          }}
        >
          <DataIcon sx={{ fontSize: 28, color: 'white' }} />
        </Avatar>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#212121', 
            fontWeight: 600,
            letterSpacing: '0.2px'
          }}
        >
          Data Quality
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#757575',
            fontWeight: 500
          }}
        >
          AI-Powered Platform
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 0,
                py: 1.5,
                transition: 'background-color 0.2s ease',
                '&.Mui-selected': {
                  background: '#f5f5f5',
                  borderLeft: '3px solid #424242',
                  '&:hover': {
                    background: '#eeeeee',
                  }
                },
                '&:hover': {
                  background: '#fafafa',
                }
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 45,
                  color: location.pathname === item.path ? '#424242' : '#757575',
                  transition: 'color 0.2s ease'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  fontSize: '0.9rem',
                  color: location.pathname === item.path ? '#212121' : '#757575'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 20, 
        left: 0,
        right: 0,
        px: 3,
        textAlign: 'center'
      }}>
        <Chip 
          label="v2.0 • Python Detection" 
          size="small"
          sx={{
            background: '#e0e0e0',
            color: '#424242',
            fontWeight: 500,
            fontSize: '0.7rem',
            borderRadius: 0
          }}
        />
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', background: 'transparent' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              background: '#f5f5f5',
              borderRadius: 0
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h5" 
              noWrap 
              component="div"
              sx={{ 
                color: '#212121',
                fontWeight: 600,
                letterSpacing: '0.2px'
              }}
            >
              Data Quality Platform
            </Typography>
            <Typography 
              variant="caption"
              sx={{ 
                color: '#9e9e9e',
                fontWeight: 600
              }}
            >
              Python + AI • Exact Location Detection
            </Typography>
          </Box>
          <Chip
            icon={<NotificationsIcon />}
            label="All Systems Operational"
            size="small"
            color="success"
            sx={{
              fontWeight: 500,
              borderRadius: 0
            }}
          />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        className="slide-in-up"
        sx={{
          flexGrow: 1,
          p: 4,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 10,
          minHeight: 'calc(100vh - 80px)',
          background: 'transparent'
        }}
      >
        <Box sx={{
          background: '#ffffff',
          borderRadius: 0,
          padding: '24px',
          minHeight: 'calc(100vh - 120px)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default Layout


