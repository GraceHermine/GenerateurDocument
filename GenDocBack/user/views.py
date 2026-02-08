from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer, UserMeSerializer


class RegisterAPIView(APIView):
	permission_classes = [AllowAny]

	def post(self, request, *args, **kwargs):
		serializer = RegisterSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

		user = serializer.save()
		return Response(
			{
				"id": user.id,
				"email": user.email,
				"username": user.username
			},
			status=status.HTTP_201_CREATED
		)


class MeAPIView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, *args, **kwargs):
		serializer = UserMeSerializer(request.user)
		return Response(serializer.data, status=status.HTTP_200_OK)


class LogoutAPIView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, *args, **kwargs):
		refresh_token = request.data.get("refresh")
		if refresh_token:
			try:
				from rest_framework_simplejwt.tokens import RefreshToken
				try:
					RefreshToken(refresh_token).blacklist()
				except AttributeError:
					pass
			except Exception:
				pass

		return Response(status=status.HTTP_204_NO_CONTENT)
