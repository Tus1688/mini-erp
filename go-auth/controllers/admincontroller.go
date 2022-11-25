package controllers

import (
	"go-auth/auth"
	"go-auth/database"
	"go-auth/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func AdminChangePassword(c *gin.Context) {
	var request models.AdminChangePassword
	var user models.User

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error while hashing password"})
		return
	}

	if database.Instance.Model(&user).Where("username = ?", request.Username).Update("password", string(hashedPassword)).RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
	auth.PurgeSessionMatchPattern(request.Username)
}

func AdminToggleActive(c *gin.Context) {
	var request models.AdminToggleActiveStatus
	var user models.User
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	query := database.Instance.Where("username = ?", request.Username).First(&user)
	if query.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if database.Instance.Model(&user).Where("username = ?", request.Username).Update("active", request.Active).RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User is already in the requested state"})
		return
	}

	if pointerTobool(request.Active) {
		c.JSON(http.StatusOK, gin.H{"message": "User activated successfully"})
	} else {
		c.JSON(http.StatusOK, gin.H{"message": "User deactivated successfully"})
	}
}

func AdminPatchUserRole(c *gin.Context) {
	var request models.AdminPatchUserRole
	if err := c.ShouldBindJSON(&request); err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	var check models.User
	database.Instance.Model(&models.User{}).Where("username = ?", request.Username).First(&check)
	if check.Username == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found, somebody else might have deleted the user"})
		return
	}
	if check.FinanceAdmin == request.FinanceAdmin &&
		check.FinanceUser == request.FinanceUser &&
		check.InventoryAdmin == request.InventoryAdmin &&
		check.InventoryUser == request.InventoryUser && check.SystemAdmin == request.SystemAdmin {
		c.JSON(http.StatusOK, gin.H{"message": "No changes detected"})
		return
	}

	record := database.Instance.Where("username = ?", request.Username).Updates(models.User{
		FinanceAdmin:   request.FinanceAdmin,
		FinanceUser:    request.FinanceUser,
		InventoryAdmin: request.InventoryAdmin,
		InventoryUser:  request.InventoryUser,
		SystemAdmin:    request.SystemAdmin,
	})
	if record.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong when updating user role"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User role updated successfully"})
}

func AdminGetUsers(c *gin.Context) {
	var responseArr []models.AdminResponseUser

	database.Instance.Table("users").
		Select("username, inventory_user, inventory_admin, finance_user, finance_admin, system_admin, active").
		Scan(&responseArr)
	if responseArr == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No users found"})
		return
	}
	c.JSON(http.StatusOK, responseArr)
}

func pointerTobool(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}
